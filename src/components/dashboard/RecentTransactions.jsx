import { LuArrowUpRight, LuArrowDownLeft, LuArrowRight } from 'react-icons/lu';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

const SkeletonRow = () => (
  <div className="flex items-center gap-3 py-3.5 animate-pulse">
    <div className="w-9 h-9 skeleton rounded-xl flex-shrink-0" />
    <div className="flex-1 space-y-2 min-w-0">
      <div className="skeleton h-3.5 rounded w-40" />
      <div className="skeleton h-3 rounded w-24" />
    </div>
    <div className="skeleton h-4 rounded w-20 flex-shrink-0" />
  </div>
);

export default function RecentTransactions({ transactions, loading }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Últimas Transações</h3>
        <Link
          to="/transactions"
          className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary hover:text-primary-700 font-semibold transition-colors"
        >
          Ver todas <LuArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {loading ? (
        <div className="divide-y divide-slate-50 dark:divide-slate-800 mt-2">
          {[0, 1, 2, 3, 4].map((i) => <SkeletonRow key={i} />)}
        </div>
      ) : !transactions?.length ? (
        <div className="py-12 flex flex-col items-center gap-2 text-slate-400">
          <span className="text-3xl select-none">💸</span>
          <p className="text-sm">Nenhuma transação neste período.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50 dark:divide-slate-800 mt-2">
          {transactions.map((tx) => {
            const isIncome = tx.type === 'income';
            return (
              <div key={tx.id} className="flex items-center gap-3 py-3.5 group">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-150 group-hover:scale-105 ${
                  isIncome ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-red-50 dark:bg-red-500/10'
                }`}>
                  {isIncome
                    ? <LuArrowUpRight className="w-4 h-4 text-emerald-600" />
                    : <LuArrowDownLeft className="w-4 h-4 text-red-500" />
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{tx.description}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {tx.category_name && (
                      <>
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: tx.category_color || '#94a3b8' }}
                        />
                        <span className="text-xs text-slate-400 truncate">{tx.category_name}</span>
                        <span className="text-xs text-slate-200 dark:text-slate-700">·</span>
                      </>
                    )}
                    <span className="text-xs text-slate-400">{formatDate(tx.date)}</span>
                  </div>
                </div>

                <span className={`text-sm font-bold flex-shrink-0 ${
                  isIncome ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  {isIncome ? '+' : '−'}{formatCurrency(tx.amount)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
