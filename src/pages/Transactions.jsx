import { useState, useEffect, useCallback, useMemo } from 'react';
import { LuPlus, LuSearch, LuX, LuSlidersHorizontal, LuTrendingUp, LuTrendingDown, LuScale } from 'react-icons/lu';
import transactionService from '../services/transactionService';
import categoryService from '../services/categoryService';
import TransactionForm from '../components/transactions/TransactionForm';
import TransactionTable from '../components/transactions/TransactionTable';
import { formatCurrency } from '../utils/formatCurrency';
import { useToast } from '../contexts/ToastContext';
import { getApiError } from '../utils/apiError';
import { cn } from '../utils/cn';

const EMPTY_FILTERS = { type: '', category_id: '', start_date: '', end_date: '', search: '' };

function SummaryPill({ icon: Icon, label, value, colorClass }) {
  return (
    <div className="card px-4 py-3.5 flex items-center gap-3">
      <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0', colorClass)}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="text-base font-bold text-slate-800 dark:text-slate-100 truncate">{formatCurrency(value)}</p>
      </div>
    </div>
  );
}

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);

  const [filters, setFilters]       = useState(EMPTY_FILTERS);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editingTx, setEditingTx]   = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const toast = useToast();

  /* ── Data fetching ─────────────────────────────── */
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.type)        params.type        = filters.type;
      if (filters.category_id) params.category_id = filters.category_id;
      if (filters.start_date)  params.start_date  = filters.start_date;
      if (filters.end_date)    params.end_date    = filters.end_date;

      const res = await transactionService.getAll(params);
      setTransactions(res.data.data ?? []);
    } catch (err) {
      toast.error(getApiError(err, 'Erro ao carregar transações.'));
    } finally {
      setLoading(false);
    }
  }, [filters.type, filters.category_id, filters.start_date, filters.end_date]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  useEffect(() => {
    categoryService.getAll()
      .then((res) => setCategories(res.data.data ?? []))
      .catch(() => {});
  }, []);

  /* ── Client-side search ────────────────────────── */
  const displayed = useMemo(() => {
    if (!filters.search.trim()) return transactions;
    const term = filters.search.toLowerCase();
    return transactions.filter((tx) =>
      tx.description.toLowerCase().includes(term) ||
      (tx.category_name ?? '').toLowerCase().includes(term)
    );
  }, [transactions, filters.search]);

  /* ── Summary ───────────────────────────────────── */
  const summary = useMemo(() => {
    const income  = displayed.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const expense = displayed.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
    return { income, expense, balance: income - expense };
  }, [displayed]);

  /* ── CRUD ──────────────────────────────────────── */
  const openCreate  = ()    => { setEditingTx(null); setModalOpen(true); };
  const openEdit    = (tx)  => { setEditingTx(tx);   setModalOpen(true); };
  const closeModal  = ()    => { setModalOpen(false); setEditingTx(null); };

  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (editingTx) {
        await transactionService.update(editingTx.id, data);
        toast.success('Transação atualizada com sucesso!');
      } else {
        await transactionService.create(data);
        toast.success('Transação adicionada com sucesso!');
      }
      closeModal();
      fetchTransactions();
    } catch (err) {
      toast.error(getApiError(err, 'Erro ao salvar transação.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRequest = (id) => setDeletingId(id);
  const handleCancelDelete  = ()   => setDeletingId(null);
  const handleConfirmDelete = async (id) => {
    try {
      await transactionService.remove(id);
      setDeletingId(null);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      toast.success('Transação excluída.');
    } catch (err) {
      toast.error(getApiError(err, 'Erro ao excluir transação.'));
      setDeletingId(null);
    }
  };

  /* ── Filter helpers ────────────────────────────── */
  const setFilter    = (key, val) => setFilters((p) => ({ ...p, [key]: val }));
  const hasFilters   = Object.values(filters).some(Boolean);
  const clearFilters = () => setFilters(EMPTY_FILTERS);

  return (
    <div className="page">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Transações</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {!loading && (
              <>{displayed.length} {displayed.length === 1 ? 'transação' : 'transações'} encontradas</>
            )}
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <LuPlus className="w-4 h-4" />
          <span>Nova transação</span>
        </button>
      </div>

      {/* ── Summary pills ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SummaryPill
          icon={LuTrendingUp}
          label="Receitas"
          value={summary.income}
          colorClass="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500"
        />
        <SummaryPill
          icon={LuTrendingDown}
          label="Despesas"
          value={summary.expense}
          colorClass="bg-red-50 dark:bg-red-500/10 text-red-400"
        />
        <SummaryPill
          icon={LuScale}
          label="Saldo"
          value={summary.balance}
          colorClass={summary.balance >= 0
            ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-500'
            : 'bg-orange-50 dark:bg-orange-500/10 text-orange-400'}
        />
      </div>

      {/* ── Filters ── */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <LuSlidersHorizontal className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Filtros</span>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium"
            >
              <LuX className="w-3 h-3" /> Limpar
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Pesquisar descrição..."
              className="input pl-9"
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
            />
            {filters.search && (
              <button
                onClick={() => setFilter('search', '')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <LuX className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Type toggle */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {[['', 'Todos'], ['income', 'Receitas'], ['expense', 'Despesas']].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setFilter('type', val)}
                className={cn(
                  'py-2 rounded-lg text-xs font-semibold transition-all duration-150',
                  filters.type === val
                    ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Category */}
          <select
            className="input"
            value={filters.category_id}
            onChange={(e) => setFilter('category_id', e.target.value)}
          >
            <option value="">Todas as categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Date range */}
          <div className="flex gap-2">
            <input
              type="date"
              className="input flex-1 min-w-0"
              title="Data início"
              value={filters.start_date}
              onChange={(e) => setFilter('start_date', e.target.value)}
            />
            <input
              type="date"
              className="input flex-1 min-w-0"
              title="Data fim"
              value={filters.end_date}
              onChange={(e) => setFilter('end_date', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <TransactionTable
        transactions={displayed}
        loading={loading}
        onEdit={openEdit}
        onDelete={handleDeleteRequest}
        deletingId={deletingId}
        onConfirmDelete={handleConfirmDelete}
        onCancelDelete={handleCancelDelete}
      />

      {/* ── Modal ── */}
      {modalOpen && (
        <TransactionForm
          transaction={editingTx}
          categories={categories}
          onSave={handleSave}
          onClose={closeModal}
          saving={saving}
        />
      )}
    </div>
  );
}
