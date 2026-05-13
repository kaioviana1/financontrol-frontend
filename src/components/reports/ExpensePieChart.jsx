import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/formatCurrency';

const FALLBACK_COLORS = [
  '#f87171', '#fb923c', '#fbbf24', '#a3e635', '#34d399',
  '#22d3ee', '#60a5fa', '#a78bfa', '#f472b6', '#94a3b8',
];

const SkeletonChart = () => (
  <div className="card p-5 animate-pulse">
    <div className="skeleton h-4 rounded w-48 mb-6" />
    <div className="flex items-center justify-center">
      <div className="skeleton w-52 h-52 rounded-full" />
    </div>
  </div>
);

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value, payload: p } = payload[0];
  return (
    <div className="bg-white rounded-xl shadow-xl border border-slate-100 px-4 py-3 text-sm min-w-[180px]">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: p.fill }} />
        <span className="font-bold text-slate-700">{name}</span>
      </div>
      <p className="text-slate-500">
        {formatCurrency(value)}
        <span className="ml-2 text-xs text-slate-400">({p.percent}%)</span>
      </p>
    </div>
  );
};

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function ExpensePieChart({ data, loading }) {
  if (loading) return <SkeletonChart />;

  const hasData = data?.length > 0;

  const chartData = (data ?? []).map((d, i) => ({
    name:    d.category_name ?? 'Sem categoria',
    value:   Number(d.total ?? 0),
    fill:    d.color || FALLBACK_COLORS[i % FALLBACK_COLORS.length],
    percent: d.percent ?? 0,
  }));

  const total = chartData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="card p-5">
      <div className="mb-5">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
          Despesas por Categoria
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">Distribuição no período</p>
      </div>

      {!hasData ? (
        <div className="h-64 flex flex-col items-center justify-center gap-2 text-slate-400">
          <span className="text-3xl">🥧</span>
          <p className="text-sm">Sem despesas no período.</p>
        </div>
      ) : (
        <>
          {/* Center total */}
          <div className="relative">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={2}
                  dataKey="value"
                  labelLine={false}
                  label={renderCustomLabel}
                >
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Donut center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ top: '-16px' }}>
              <p className="text-[11px] text-slate-400 font-medium">Total</p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                {formatCurrency(total)}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
