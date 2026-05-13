import { useState, useEffect, useMemo } from 'react';
import { LuPlus, LuPencil, LuTrash2, LuCheck, LuX, LuLock } from 'react-icons/lu';
import categoryService from '../services/categoryService';
import CategoryForm from '../components/categories/CategoryForm';
import EmptyState from '../components/ui/EmptyState';
import { useToast } from '../contexts/ToastContext';
import { getApiError } from '../utils/apiError';
import { cn } from '../utils/cn';

const TYPE_TABS = [
  { value: 'all',     label: 'Todas' },
  { value: 'income',  label: 'Receitas' },
  { value: 'expense', label: 'Despesas' },
];

/* ── Skeleton ─────────────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="card p-4 flex items-center gap-3 animate-pulse">
    <div className="w-10 h-10 skeleton rounded-xl flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="skeleton h-3.5 rounded w-32" />
      <div className="skeleton h-3 rounded w-16" />
    </div>
    <div className="skeleton w-7 h-7 rounded-lg" />
    <div className="skeleton w-7 h-7 rounded-lg" />
  </div>
);

/* ── Category card ────────────────────────────────────────────── */
function CategoryCard({ category, deletingId, onEdit, onDelete, onConfirmDelete, onCancelDelete }) {
  const isSystem   = category.user_id === null;
  const isDeleting = deletingId === category.id;
  const isIncome   = category.type === 'income';

  return (
    <div className={cn(
      'card p-4 flex items-center gap-3 transition-all duration-150',
      isDeleting ? 'bg-red-50 dark:bg-red-500/5 border-red-100 dark:border-red-500/20' : 'hover:shadow-card-hover'
    )}>
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
        style={{ background: (category.color || '#94a3b8') + '22' }}
      >
        {category.icon
          ? <span>{category.icon}</span>
          : <span className="w-3.5 h-3.5 rounded-full" style={{ background: category.color || '#94a3b8' }} />
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{category.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={cn(
            'text-xs font-medium px-1.5 py-0.5 rounded-md',
            isIncome
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
              : 'bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400'
          )}>
            {isIncome ? 'Receita' : 'Despesa'}
          </span>
          {isSystem && (
            <span className="flex items-center gap-0.5 text-xs text-slate-400">
              <LuLock className="w-2.5 h-2.5" /> Sistema
            </span>
          )}
        </div>
      </div>

      {/* Color dot */}
      <span
        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
        style={{ background: category.color || '#94a3b8' }}
      />

      {/* Actions */}
      {!isSystem && (
        <div className="flex items-center gap-1 flex-shrink-0">
          {isDeleting ? (
            <>
              <button
                onClick={() => onConfirmDelete(category.id)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors"
              >
                <LuCheck className="w-3 h-3" /> Confirmar
              </button>
              <button
                onClick={onCancelDelete}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors"
                title="Cancelar"
              >
                <LuX className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onEdit(category)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                title="Editar"
              >
                <LuPencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(category.id)}
                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors"
                title="Excluir"
              >
                <LuTrash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Section ──────────────────────────────────────────────────── */
function Section({ title, categories, colorClass, ...rest }) {
  if (!categories.length) return null;
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className={cn('w-1 h-4 rounded-full', colorClass)} />
        <h2 className="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">{title}</h2>
        <span className="text-xs text-slate-400">({categories.length})</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {categories.map((c) => <CategoryCard key={c.id} category={c} {...rest} />)}
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────── */
export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [typeTab, setTypeTab]       = useState('all');
  const [modalOpen, setModalOpen]   = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const toast = useToast();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryService.getAll();
      setCategories(res.data.data ?? []);
    } catch (err) {
      toast.error(getApiError(err, 'Erro ao carregar categorias.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() =>
    typeTab === 'all' ? categories : categories.filter((c) => c.type === typeTab),
    [categories, typeTab]
  );

  const incomeList  = filtered.filter((c) => c.type === 'income');
  const expenseList = filtered.filter((c) => c.type === 'expense');

  const userCount   = categories.filter((c) => c.user_id !== null).length;
  const systemCount = categories.filter((c) => c.user_id === null).length;

  const openCreate = ()    => { setEditingCat(null); setModalOpen(true); };
  const openEdit   = (cat) => { setEditingCat(cat);  setModalOpen(true); };
  const closeModal = ()    => { setModalOpen(false); setEditingCat(null); };

  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (editingCat) {
        await categoryService.update(editingCat.id, data);
        toast.success('Categoria atualizada com sucesso!');
      } else {
        await categoryService.create(data);
        toast.success('Categoria criada com sucesso!');
      }
      closeModal();
      fetchCategories();
    } catch (err) {
      toast.error(getApiError(err, 'Erro ao salvar categoria.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRequest = (id) => setDeletingId(id);
  const handleCancelDelete  = ()   => setDeletingId(null);
  const handleConfirmDelete = async (id) => {
    try {
      await categoryService.remove(id);
      setDeletingId(null);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success('Categoria excluída.');
    } catch (err) {
      toast.error(getApiError(err, 'Erro ao excluir categoria.'));
      setDeletingId(null);
    }
  };

  const cardProps = { deletingId, onEdit: openEdit, onDelete: handleDeleteRequest, onConfirmDelete: handleConfirmDelete, onCancelDelete: handleCancelDelete };

  return (
    <div className="page">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Categorias</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {userCount} suas &nbsp;·&nbsp; {systemCount} do sistema
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <LuPlus className="w-4 h-4" /> Nova categoria
        </button>
      </div>

      {/* ── Type tabs ── */}
      <div className="flex gap-1 p-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm w-fit">
        {TYPE_TABS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setTypeTab(value)}
            className={cn(
              'px-4 py-1.5 rounded-xl text-sm font-semibold transition-all duration-150',
              typeTab === value
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="space-y-6">
          <div>
            <div className="skeleton h-4 rounded w-24 mb-3" />
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {[0, 1, 2, 3, 4, 5].map((i) => <SkeletonCard key={i} />)}
            </div>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="🏷️"
          title="Nenhuma categoria encontrada"
          description="Crie sua primeira categoria para organizar suas transações."
          action={
            <button onClick={openCreate} className="btn-primary mt-2">
              <LuPlus className="w-4 h-4" /> Nova categoria
            </button>
          }
        />
      ) : (
        <div className="space-y-8">
          <Section title="Receitas"  categories={incomeList}  colorClass="bg-emerald-400" {...cardProps} />
          <Section title="Despesas"  categories={expenseList} colorClass="bg-red-400"     {...cardProps} />
        </div>
      )}

      {/* ── Modal ── */}
      {modalOpen && (
        <CategoryForm
          category={editingCat}
          onSave={handleSave}
          onClose={closeModal}
          saving={saving}
        />
      )}
    </div>
  );
}
