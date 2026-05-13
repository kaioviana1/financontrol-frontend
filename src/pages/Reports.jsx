import { useState, useEffect, useCallback, useMemo } from 'react';
import { LuRefreshCw, LuChevronLeft, LuChevronRight, LuTrendingUp, LuTrendingDown, LuWallet, LuChartBar } from 'react-icons/lu';
import transactionService from '../services/transactionService';
import { formatCurrency } from '../utils/formatCurrency';
import { useToast } from '../contexts/ToastContext';
import { getApiError } from '../utils/apiError';
import MonthlyChart from '../components/reports/MonthlyChart';
import ExpensePieChart from '../components/reports/ExpensePieChart';

/* ── aggregation helpers ─────────────────────────────────────── */
function aggregateByMonth(transactions) {
  const map = {};
  for (const t of transactions) {
    const month = new Date(t.date + 'T00:00:00').getMonth() + 1;
    if (!map[month]) map[month] = { month, income: 0, expense: 0, balance: 0 };
    if (t.type === 'income') map[month].income  += Number(t.amount);
    else                     map[month].expense += Number(t.amount);
    map[month].balance = map[month].income - map[month].expense;
  }
  return Object.values(map);
}

function aggregateByCategory(transactions) {
  const map = {};
  const expenses = transactions.filter((t) => t.type === 'expense');
  const total    = expenses.reduce((s, t) => s + Number(t.amount), 0);
  for (const t of expenses) {
    const key = t.category_id ?? 'none';
    if (!map[key]) map[key] = { category_name: t.category_name ?? 'Sem categoria', color: t.category_color ?? '#94a3b8', total: 0 };
    map[key].total += Number(t.amount);
  }
  return Object.values(map)
    .map((d) => ({ ...d, percent: total > 0 ? +((d.total / total) * 100).toFixed(1) : 0 }))
    .sort((a, b) => b.total - a.total);
}

/* ── Summary card ────────────────────────────────────────────── */
function SummaryCard({ label, value, icon: Icon, color, loading }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400 font-medium mb-0.5">{label}</p>
        {loading
          ? <div className="skeleton h-5 rounded w-28" />
          : <p className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate">{formatCurrency(value)}</p>
        }
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────── */
export default function Reports() {
  const [year, setYear]          = useState(new Date().getFullYear());
  const [transactions, setTrans] = useState([]);
  const [loading, setLoading]    = useState(true);
  const [spinning, setSpinning]  = useState(false);
  const toast = useToast();

  const fetchData = useCallback(async (y, spin = false) => {
    if (spin) setSpinning(true);
    setLoading(true);
    try {
      const { data } = await transactionService.getAll({
        start_date: `${y}-01-01`,
        end_date:   `${y}-12-31`,
        limit: 9999,
      });
      setTrans(data?.data?.transactions ?? data?.data ?? []);
    } catch (err) {
      toast.error(getApiError(err, 'Erro ao carregar relatórios.'));
      setTrans([]);
    } finally {
      setLoading(false);
      if (spin) setTimeout(() => setSpinning(false), 400);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchData(year); }, [year, fetchData]);

  const monthlyData  = useMemo(() => aggregateByMonth(transactions),   [transactions]);
  const categoryData = useMemo(() => aggregateByCategory(transactions), [transactions]);

  const totalIncome  = useMemo(() => transactions.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0),  [transactions]);
  const totalExpense = useMemo(() => transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0), [transactions]);
  const balance      = totalIncome - totalExpense;

  return (
    <div className="page">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Relatórios</h1>
          <p className="text-sm text-slate-400 mt-0.5">Análise financeira do ano {year}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Year navigator */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-1 py-1">
            <button
              onClick={() => setYear((y) => y - 1)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Ano anterior"
            >
              <LuChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 w-12 text-center select-none">
              {year}
            </span>
            <button
              onClick={() => setYear((y) => y + 1)}
              disabled={year >= new Date().getFullYear()}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Próximo ano"
            >
              <LuChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => fetchData(year, true)}
            className="btn-secondary flex items-center gap-2"
          >
            <LuRefreshCw className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
        </div>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard label="Receitas no Ano"  value={totalIncome}  icon={LuTrendingUp}   color="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500" loading={loading} />
        <SummaryCard label="Despesas no Ano"  value={totalExpense} icon={LuTrendingDown} color="bg-red-50 dark:bg-red-500/10 text-red-400"             loading={loading} />
        <SummaryCard
          label="Saldo do Ano"
          value={balance}
          icon={LuWallet}
          color={balance >= 0
            ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-500'
            : 'bg-orange-50 dark:bg-orange-500/10 text-orange-400'}
          loading={loading}
        />
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <MonthlyChart data={monthlyData} loading={loading} />
        </div>
        <div className="lg:col-span-1">
          <ExpensePieChart data={categoryData} loading={loading} />
        </div>
      </div>

      {/* ── Top categories table ── */}
      {!loading && categoryData.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-5">
            <LuChartBar className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
              Ranking de Despesas por Categoria
            </h3>
          </div>
          <div className="space-y-3.5">
            {categoryData.slice(0, 8).map((cat, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-slate-400 w-4 text-right tabular-nums">{i + 1}</span>
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                <span className="text-sm text-slate-600 dark:text-slate-300 flex-1 truncate min-w-0">
                  {cat.category_name}
                </span>
                <div className="w-24 sm:w-40 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex-shrink-0">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${cat.percent}%`, background: cat.color }}
                  />
                </div>
                <span className="text-xs text-slate-400 w-10 text-right tabular-nums flex-shrink-0">
                  {cat.percent}%
                </span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 w-24 text-right tabular-nums flex-shrink-0">
                  {formatCurrency(cat.total)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
