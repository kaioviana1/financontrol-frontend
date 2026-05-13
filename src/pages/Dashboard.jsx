import { useState, useEffect, useCallback } from 'react';
import { LuChevronLeft, LuChevronRight, LuRefreshCw } from 'react-icons/lu';
import dashboardService from '../services/dashboardService';
import DashboardCards from '../components/dashboard/DashboardCards';
import ExpenseChart from '../components/dashboard/ExpenseChart';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import { formatMonthYear } from '../utils/formatDate';
import { useToast } from '../contexts/ToastContext';

export default function Dashboard() {
  const now = new Date();
  const [year, setYear]   = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await dashboardService.getData({ year, month });
      setData(res.data.data);
    } catch {
      toast.error('Não foi possível carregar os dados. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  }, [year, month]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchData(); }, [fetchData]);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  return (
    <div className="page">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-0.5">Visão geral das suas finanças</p>
        </div>

        {/* Month navigator */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm px-2 py-1">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Mês anterior"
          >
            <LuChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 min-w-[140px] text-center capitalize select-none">
            {formatMonthYear(year, month)}
          </span>

          <button
            onClick={nextMonth}
            disabled={isCurrentMonth}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Próximo mês"
          >
            <LuChevronRight className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-slate-100 dark:bg-slate-800 mx-0.5" />

          <button
            onClick={fetchData}
            disabled={loading}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
            title="Atualizar dados"
          >
            <LuRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <DashboardCards
        summary={data?.summary}
        overallBalance={data?.overall_balance}
        loading={loading}
      />

      <ExpenseChart
        summary={data?.summary}
        expensesByCategory={data?.expenses_by_category}
        monthlyHistory={data?.monthly_history}
        loading={loading}
      />

      <RecentTransactions
        transactions={data?.recent_transactions}
        loading={loading}
      />
    </div>
  );
}
