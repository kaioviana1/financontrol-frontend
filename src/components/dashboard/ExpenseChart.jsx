import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from 'recharts';
import { formatCurrency } from '../../utils/formatCurrency';

const PT_MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const FALLBACK_COLORS = [
  '#80f96d', '#60a5fa', '#f97316', '#a78bfa',
  '#fb7185', '#34d399', '#fbbf24', '#e879f9',
];

/* ── Build 6-month bar data, filling gaps ── */
function buildBarData(monthlyHistory) {
  const today = new Date();
  const result = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const found = (monthlyHistory ?? []).find((r) => r.year === y && r.month === m);
    result.push({
      name: PT_MONTHS[m - 1],
      Receitas: found?.total_income  ?? 0,
      Despesas: found?.total_expense ?? 0,
    });
  }

  return result;
}

/* ── Skeletons ── */
const SkeletonChart = () => (
  <div className="card p-5 animate-pulse">
    <div className="skeleton h-4 rounded w-44 mb-6" />
    <div className="skeleton h-52 rounded-xl" />
  </div>
);

/* ── Tooltips ── */
const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 px-3 py-2.5 text-sm">
      <p className="text-xs font-semibold text-slate-400 mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="font-medium" style={{ color: entry.fill }}>
          {entry.name}: <span className="text-slate-700 dark:text-slate-200">{formatCurrency(entry.value)}</span>
        </p>
      ))}
    </div>
  );
};

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 px-3 py-2.5 text-sm">
      <p className="font-semibold text-slate-700 dark:text-slate-200">{name}</p>
      <p className="text-slate-500 dark:text-slate-400">{formatCurrency(value)}</p>
    </div>
  );
};

const yTickFormatter = (v) => {
  if (v >= 1000) return `R$${(v / 1000).toFixed(0)}k`;
  return `R$${v}`;
};

export default function ExpenseChart({ expensesByCategory, monthlyHistory, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonChart />
        <SkeletonChart />
      </div>
    );
  }

  const barData = buildBarData(monthlyHistory);

  const hasBarData = barData.some((d) => d.Receitas > 0 || d.Despesas > 0);

  const pieData = (expensesByCategory ?? []).map((c, i) => ({
    name:  c.name,
    value: Number(c.total),
    color: c.color || FALLBACK_COLORS[i % FALLBACK_COLORS.length],
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ── Receitas vs Despesas (últimos 6 meses) ── */}
      <div className="card p-5">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-5">
          Receitas vs Despesas <span className="text-slate-400 font-normal">(últimos 6 meses)</span>
        </h3>

        {!hasBarData ? (
          <div className="h-[220px] flex flex-col items-center justify-center gap-2 text-slate-400">
            <span className="text-3xl select-none">📉</span>
            <p className="text-sm">Nenhuma movimentação nos últimos 6 meses.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barSize={18} barGap={4} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={yTickFormatter}
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(148,163,184,0.08)' }} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
              />
              <Bar dataKey="Receitas" fill="#34d399" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Despesas" fill="#f87171" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Gastos por Categoria ── */}
      <div className="card p-5">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-5">Gastos por Categoria</h3>
        {pieData.length === 0 ? (
          <div className="h-[220px] flex flex-col items-center justify-center gap-2 text-slate-400">
            <span className="text-3xl select-none">📊</span>
            <p className="text-sm">Nenhum gasto neste período.</p>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="w-[160px] flex-shrink-0">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={78}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex-1 space-y-2 overflow-hidden">
              {pieData.map((entry) => {
                const total = pieData.reduce((s, e) => s + e.value, 0);
                const pct   = total > 0 ? Math.round((entry.value / total) * 100) : 0;
                return (
                  <div key={entry.name} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: entry.color }}
                      />
                      <span className="text-xs text-slate-600 dark:text-slate-300 truncate">{entry.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[10px] text-slate-400">{pct}%</span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        {formatCurrency(entry.value)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
