import { LuTrendingUp, LuTrendingDown, LuWallet, LuScale } from 'react-icons/lu';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../utils/formatCurrency';
import { cn } from '../../utils/cn';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  show:   { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const SkeletonCard = () => (
  <div className="card p-5 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="skeleton h-3 rounded w-28" />
      <div className="skeleton w-9 h-9 rounded-xl" />
    </div>
    <div className="skeleton h-7 rounded w-36 mb-1.5" />
    <div className="skeleton h-3 rounded w-20" />
  </div>
);

const buildCards = (summary, overallBalance) => {
  const balance = summary?.balance ?? 0;
  return [
    {
      label: 'Saldo Geral',
      value: overallBalance ?? 0,
      sub:   'acumulado histórico',
      Icon:  LuWallet,
      iconBg: 'bg-slate-100 dark:bg-slate-800',
      iconColor: 'text-slate-500 dark:text-slate-400',
      valueColor: 'text-slate-900 dark:text-slate-100',
    },
    {
      label: 'Receitas do Mês',
      value: summary?.total_income ?? 0,
      sub:   'entradas no período',
      Icon:  LuTrendingUp,
      iconBg: 'bg-emerald-50 dark:bg-emerald-500/10',
      iconColor: 'text-emerald-500',
      valueColor: 'text-emerald-700 dark:text-emerald-400',
    },
    {
      label: 'Despesas do Mês',
      value: summary?.total_expense ?? 0,
      sub:   'saídas no período',
      Icon:  LuTrendingDown,
      iconBg: 'bg-red-50 dark:bg-red-500/10',
      iconColor: 'text-red-400',
      valueColor: 'text-red-600 dark:text-red-400',
    },
    {
      label: 'Saldo do Mês',
      value: balance,
      sub:   balance >= 0 ? 'receitas > despesas' : 'despesas > receitas',
      Icon:  LuScale,
      iconBg: balance >= 0 ? 'bg-primary/10' : 'bg-orange-50 dark:bg-orange-500/10',
      iconColor: balance >= 0 ? 'text-primary-600' : 'text-orange-400',
      valueColor: balance >= 0 ? 'text-primary-700 dark:text-primary-400' : 'text-orange-600 dark:text-orange-400',
    },
  ];
};

export default function DashboardCards({ summary, overallBalance, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {buildCards(summary, overallBalance).map(({ label, value, sub, Icon, iconBg, iconColor, valueColor }) => (
        <motion.div key={label} variants={cardVariants} className="card p-5 hover:shadow-card-hover transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', iconBg)}>
              <Icon className={cn('w-4 h-4', iconColor)} />
            </div>
          </div>
          <p className={cn('text-2xl font-bold tracking-tight', valueColor)}>
            {formatCurrency(value)}
          </p>
          <p className="text-xs text-slate-400 mt-1">{sub}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}
