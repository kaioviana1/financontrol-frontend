import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LuPlus, LuPencil, LuTrash2, LuCheck, LuX,
  LuTarget, LuCalendar, LuTrendingUp,
} from 'react-icons/lu';
import goalService from '../services/goalService';
import { formatCurrency } from '../utils/formatCurrency';
import { useToast } from '../contexts/ToastContext';
import { getApiError } from '../utils/apiError';
import { cn } from '../utils/cn';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import Spinner from '../components/ui/Spinner';

/* ── helpers ───────────────────────────────────── */
function pct(current, target) {
  if (!target || target <= 0) return 0;
  return Math.min(100, Math.round((Number(current) / Number(target)) * 100));
}

function statusOf(goal) {
  const p = pct(goal.current_amount, goal.target_amount);
  if (p >= 100) return { label: 'Concluída', cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400', barColor: 'bg-emerald-400' };
  if (goal.deadline && new Date(goal.deadline) < new Date()) return { label: 'Atrasada', cls: 'bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400', barColor: 'bg-red-400' };
  if (p >= 75) return { label: 'Quase lá', cls: 'bg-primary/10 text-primary-700 dark:text-primary-400', barColor: 'bg-primary' };
  return { label: 'Em progresso', cls: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400', barColor: 'bg-blue-400' };
}

function formatDeadline(d) {
  if (!d) return null;
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ── goal card ─────────────────────────────────── */
function GoalCard({ goal, onEdit, onDelete, deletingId, onConfirmDelete, onCancelDelete }) {
  const isDeleting = deletingId === goal.id;
  const p     = pct(goal.current_amount, goal.target_amount);
  const status = statusOf(goal);
  const remaining = Math.max(0, Number(goal.target_amount) - Number(goal.current_amount));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className={cn(
        'card p-5 transition-shadow duration-200',
        !isDeleting && 'hover:shadow-card-hover',
        isDeleting && 'ring-2 ring-red-300 dark:ring-red-500/40'
      )}
    >
      {/* top row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <LuTarget className="w-5 h-5 text-primary-600" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{goal.title}</p>
            {goal.deadline && (
              <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-400">
                <LuCalendar className="w-3 h-3" />
                <span>{formatDeadline(goal.deadline)}</span>
              </div>
            )}
          </div>
        </div>
        <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0', status.cls)}>
          {status.label}
        </span>
      </div>

      {/* amounts */}
      <div className="flex items-end justify-between mb-2">
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Acumulado</p>
          <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{formatCurrency(goal.current_amount)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 mb-0.5">Meta</p>
          <p className="text-base font-semibold text-slate-500 dark:text-slate-400">{formatCurrency(goal.target_amount)}</p>
        </div>
      </div>

      {/* progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-slate-400">Progresso</span>
          <span className="font-semibold text-slate-600 dark:text-slate-300">{p}%</span>
        </div>
        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className={cn('h-full rounded-full', status.barColor)}
            initial={{ width: 0 }}
            animate={{ width: `${p}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.15 }}
          />
        </div>
        {p < 100 && (
          <p className="text-xs text-slate-400 mt-1">Faltam {formatCurrency(remaining)}</p>
        )}
      </div>

      {/* actions */}
      <div className="flex items-center justify-end gap-1 pt-1 border-t border-slate-50 dark:border-slate-800">
        {isDeleting ? (
          <>
            <button onClick={() => onConfirmDelete(goal.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors">
              <LuCheck className="w-3 h-3" /> Confirmar
            </button>
            <button onClick={onCancelDelete} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors">
              <LuX className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <>
            <button onClick={() => onEdit(goal)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors" title="Editar">
              <LuPencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onDelete(goal.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors" title="Excluir">
              <LuTrash2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}

/* ── form modal ────────────────────────────────── */
const EMPTY_FORM = { title: '', target_amount: '', current_amount: '', deadline: '' };

function validateGoal(f) {
  const e = {};
  if (!f.title.trim()) e.title = 'Título é obrigatório.';
  if (!f.target_amount || Number(f.target_amount) <= 0) e.target_amount = 'Informe uma meta maior que zero.';
  if (f.current_amount && Number(f.current_amount) < 0) e.current_amount = 'Valor não pode ser negativo.';
  return e;
}

function GoalForm({ goal, onSave, onClose, saving }) {
  const isEdit = Boolean(goal);
  const [form, setForm]     = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(goal
      ? { title: goal.title, target_amount: String(goal.target_amount), current_amount: String(goal.current_amount ?? 0), deadline: goal.deadline?.split('T')[0] ?? '' }
      : EMPTY_FORM
    );
    setErrors({});
  }, [goal]);

  const set = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fieldErrors = validateGoal(form);
    if (Object.keys(fieldErrors).length) { setErrors(fieldErrors); return; }
    onSave({
      title:          form.title.trim(),
      target_amount:  Number(form.target_amount),
      current_amount: form.current_amount ? Number(form.current_amount) : 0,
      deadline:       form.deadline || null,
    });
  };

  return (
    <Modal open onClose={onClose} title={isEdit ? 'Editar meta' : 'Nova meta'}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col flex-1 overflow-hidden">
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          <div>
            <label className="input-label">Título da meta</label>
            <input type="text" placeholder="Ex: Reserva de emergência, Viagem..." autoFocus className={cn('input', errors.title && 'border-red-400 focus:ring-red-200')} value={form.title} onChange={(e) => set('title', e.target.value)} />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Valor da meta (R$)</label>
              <input type="number" placeholder="0,00" min="0.01" step="0.01" className={cn('input', errors.target_amount && 'border-red-400 focus:ring-red-200')} value={form.target_amount} onChange={(e) => set('target_amount', e.target.value)} />
              {errors.target_amount && <p className="mt-1 text-xs text-red-500">{errors.target_amount}</p>}
            </div>
            <div>
              <label className="input-label">Já guardei (R$) <span className="text-slate-400 font-normal">(opcional)</span></label>
              <input type="number" placeholder="0,00" min="0" step="0.01" className={cn('input', errors.current_amount && 'border-red-400 focus:ring-red-200')} value={form.current_amount} onChange={(e) => set('current_amount', e.target.value)} />
              {errors.current_amount && <p className="mt-1 text-xs text-red-500">{errors.current_amount}</p>}
            </div>
          </div>

          <div>
            <label className="input-label">Prazo <span className="text-slate-400 font-normal">(opcional)</span></label>
            <input type="date" className="input" value={form.deadline} onChange={(e) => set('deadline', e.target.value)} />
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? <Spinner /> : (isEdit ? 'Salvar' : 'Criar meta')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ── summary strip ─────────────────────────────── */
function GoalSummary({ goals }) {
  const total     = goals.length;
  const completed = goals.filter((g) => pct(g.current_amount, g.target_amount) >= 100).length;
  const totalTarget  = goals.reduce((s, g) => s + Number(g.target_amount), 0);
  const totalCurrent = goals.reduce((s, g) => s + Number(g.current_amount), 0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        { label: 'Total de metas', value: total,                 isNumber: true },
        { label: 'Concluídas',     value: completed,             isNumber: true },
        { label: 'Valor total',    value: totalTarget,  isCurrency: true },
        { label: 'Já guardado',    value: totalCurrent, isCurrency: true },
      ].map(({ label, value, isNumber, isCurrency }) => (
        <div key={label} className="card px-4 py-3.5">
          <p className="text-xs text-slate-400 font-medium mb-0.5">{label}</p>
          <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
            {isCurrency ? formatCurrency(value) : value}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ── skeleton ──────────────────────────────────── */
const SkeletonGoal = () => (
  <div className="card p-5 animate-pulse space-y-3">
    <div className="flex items-center gap-3">
      <div className="skeleton w-10 h-10 rounded-2xl" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3.5 rounded w-40" />
        <div className="skeleton h-3 rounded w-24" />
      </div>
    </div>
    <div className="skeleton h-2 rounded-full w-full" />
    <div className="flex justify-between">
      <div className="skeleton h-5 rounded w-24" />
      <div className="skeleton h-4 rounded w-16" />
    </div>
  </div>
);

/* ── page ──────────────────────────────────────── */
export default function Goals() {
  const [goals, setGoals]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [deletingId, setDeletingId]  = useState(null);
  const [filter, setFilter]     = useState('all'); // all | active | completed
  const toast = useToast();

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await goalService.getAll();
      setGoals(res.data.data ?? []);
    } catch (err) {
      toast.error(getApiError(err, 'Erro ao carregar metas.'));
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  const displayed = useMemo(() => {
    if (filter === 'completed') return goals.filter((g) => pct(g.current_amount, g.target_amount) >= 100);
    if (filter === 'active')    return goals.filter((g) => pct(g.current_amount, g.target_amount) < 100);
    return goals;
  }, [goals, filter]);

  const openCreate = ()     => { setEditingGoal(null); setModalOpen(true); };
  const openEdit   = (goal) => { setEditingGoal(goal); setModalOpen(true); };
  const closeModal = ()     => { setModalOpen(false); setEditingGoal(null); };

  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (editingGoal) {
        await goalService.update(editingGoal.id, data);
        toast.success('Meta atualizada!');
      } else {
        await goalService.create(data);
        toast.success('Meta criada!');
      }
      closeModal();
      fetchGoals();
    } catch (err) {
      toast.error(getApiError(err, 'Erro ao salvar meta.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRequest  = (id) => setDeletingId(id);
  const handleCancelDelete   = ()   => setDeletingId(null);
  const handleConfirmDelete  = async (id) => {
    try {
      await goalService.remove(id);
      setDeletingId(null);
      setGoals((prev) => prev.filter((g) => g.id !== id));
      toast.success('Meta excluída.');
    } catch (err) {
      toast.error(getApiError(err, 'Erro ao excluir meta.'));
      setDeletingId(null);
    }
  };

  const TABS = [
    { value: 'all',       label: 'Todas',      count: goals.length },
    { value: 'active',    label: 'Em progresso', count: goals.filter((g) => pct(g.current_amount, g.target_amount) < 100).length },
    { value: 'completed', label: 'Concluídas', count: goals.filter((g) => pct(g.current_amount, g.target_amount) >= 100).length },
  ];

  return (
    <div className="page">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Metas Financeiras</h1>
          <p className="text-sm text-slate-400 mt-0.5">Acompanhe e alcance seus objetivos</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <LuPlus className="w-4 h-4" />
          <span>Nova meta</span>
        </button>
      </div>

      {/* summary */}
      {!loading && goals.length > 0 && <GoalSummary goals={goals} />}

      {/* tabs */}
      {!loading && goals.length > 0 && (
        <div className="flex gap-1 p-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm w-fit">
          {TABS.map(({ value, label, count }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150',
                filter === value
                  ? 'bg-primary text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              )}
            >
              {label}
              <span className={cn('text-xs px-1.5 py-0.5 rounded-full', filter === value ? 'bg-slate-900/10' : 'bg-slate-100 dark:bg-slate-800')}>
                {count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[0, 1, 2].map((i) => <SkeletonGoal key={i} />)}
        </div>
      ) : displayed.length === 0 ? (
        goals.length === 0 ? (
          <EmptyState
            icon={<LuTarget className="w-10 h-10 text-slate-300" />}
            title="Nenhuma meta cadastrada"
            description="Defina objetivos financeiros e acompanhe seu progresso."
            action={<button onClick={openCreate} className="btn-primary"><LuPlus className="w-4 h-4" /> Criar meta</button>}
          />
        ) : (
          <EmptyState icon={<LuTrendingUp className="w-10 h-10 text-slate-300" />} title="Nenhuma meta neste filtro" />
        )
      ) : (
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5" layout>
          <AnimatePresence>
            {displayed.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={openEdit}
                onDelete={handleDeleteRequest}
                deletingId={deletingId}
                onConfirmDelete={handleConfirmDelete}
                onCancelDelete={handleCancelDelete}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* modal */}
      {modalOpen && (
        <GoalForm
          goal={editingGoal}
          onSave={handleSave}
          onClose={closeModal}
          saving={saving}
        />
      )}
    </div>
  );
}

