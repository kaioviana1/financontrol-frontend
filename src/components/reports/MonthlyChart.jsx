import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../../utils/formatCurrency';

const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const SkeletonChart = () => (
  <div className="card p-5 animate-pulse">
    <div className="skeleton h-4 rounded w-48 mb-6" />
    <div className="skeleton h-64 rounded-xl" />
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-xl border border-slate-100 px-4 py-3 text-sm min-w-[180px]">
      <p className="font-bold text-slate-700 mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            {entry.name}
          </span>
          <span className="font-semibold" style={{ color: entry.color }}>
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function MonthlyChart({ data, loading }) {
  if (loading) return <SkeletonChart />;

  const chartData = MONTH_LABELS.map((label, i) => {
    const m = data?.find((d) => d.month === i + 1);
    return {
      name:    label,
      Receitas: m?.income  ?? 0,
      Despesas: m?.expense ?? 0,
      Saldo:    m?.balance ?? 0,
    };
  });

  const hasData = chartData.some((d) => d.Receitas > 0 || d.Despesas > 0);

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
            Receitas vs Despesas — Mensal
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Evolução ao longo do ano</p>
        </div>
      </div>

      {!hasData ? (
        <div className="h-64 flex flex-col items-center justify-center gap-2 text-slate-400">
          <span className="text-3xl">📊</span>
          <p className="text-sm">Sem dados para o período selecionado.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              width={44}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12, paddingTop: 16 }}
            />
            <Bar dataKey="Receitas" fill="#80f96d" radius={[4, 4, 0, 0]} barSize={18} />
            <Bar dataKey="Despesas" fill="#f87171" radius={[4, 4, 0, 0]} barSize={18} />
            <Line
              type="monotone"
              dataKey="Saldo"
              stroke="#60a5fa"
              strokeWidth={2}
              dot={{ r: 3, fill: '#60a5fa' }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
