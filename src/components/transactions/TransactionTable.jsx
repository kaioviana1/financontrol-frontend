import { LuArrowUpRight, LuArrowDownLeft, LuPencil, LuTrash2, LuCheck, LuX } from 'react-icons/lu';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { cn } from '../../utils/cn';
import EmptyState from '../ui/EmptyState';

/* ── Skeletons ──────────────────────────────────────────────── */
const SkeletonRow = () => (
  <div className="flex items-center gap-3 px-4 py-3.5 animate-pulse">
    <div className="w-9 h-9 skeleton rounded-xl flex-shrink-0" />
    <div className="flex-1 space-y-2 min-w-0">
      <div className="skeleton h-3.5 rounded w-44" />
      <div className="skeleton h-3 rounded w-24" />
    </div>
    <div className="hidden sm:block skeleton h-5 rounded-full w-16" />
    <div className="skeleton h-4 rounded w-24" />
    <div className="hidden sm:block skeleton h-3 rounded w-20" />
    <div className="flex gap-1">
      <div className="skeleton w-7 h-7 rounded-lg" />
      <div className="skeleton w-7 h-7 rounded-lg" />
    </div>
  </div>
);

/* ── Single row ─────────────────────────────────────────────── */
function TxRow({ tx, deletingId, onEdit, onDelete, onConfirmDelete, onCancelDelete }) {
  const isDeleting = deletingId === tx.id;
  const isIncome   = tx.type === 'income';

  return (
    /* Mobile: card-style. Desktop: row */
    <div
      className={cn(
        'group transition-colors duration-150',
        'flex flex-col sm:flex-row sm:items-center gap-3',
        'px-4 py-4 sm:py-3.5',
        isDeleting
          ? 'bg-red-50 dark:bg-red-500/10'
          : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
      )}
    >
      {/* ── Top row (mobile) / Main content (desktop) ─── */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Icon */}
        <div className={cn(
          'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
          isIncome ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-red-50 dark:bg-red-500/10'
        )}>
          {isIncome
            ? <LuArrowUpRight className="w-4 h-4 text-emerald-600" />
            : <LuArrowDownLeft className="w-4 h-4 text-red-500" />
          }
        </div>

        {/* Description + category */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
            {tx.description}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            {tx.category_name && (
              <span className={cn(
                'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-medium',
                isIncome
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
              )}>
                {tx.category_name}
              </span>
            )}
            {/* Date shown inline on mobile */}
            <span className="text-xs text-slate-400 sm:hidden">{formatDate(tx.date)}</span>
          </div>
        </div>

        {/* Amount + actions — always visible, right side on mobile */}
        <div className="flex items-center gap-2 flex-shrink-0 sm:hidden">
          <p className={cn(
            'text-sm font-bold',
            isIncome ? 'text-emerald-600' : 'text-red-500'
          )}>
            {isIncome ? '+' : '−'}{formatCurrency(tx.amount)}
          </p>
          <ActionButtons
            tx={tx}
            isDeleting={isDeleting}
            onEdit={onEdit}
            onDelete={onDelete}
            onConfirmDelete={onConfirmDelete}
            onCancelDelete={onCancelDelete}
          />
        </div>
      </div>

      {/* ── Desktop-only extras ─────────────────────── */}
      <div className="hidden sm:flex sm:items-center sm:gap-3 flex-shrink-0">
        {/* Type badge */}
        <span className={cn(
          'px-2 py-0.5 rounded-full text-xs font-semibold w-20 text-center',
          isIncome ? 'badge-income' : 'badge-expense'
        )}>
          {isIncome ? 'Receita' : 'Despesa'}
        </span>

        {/* Amount */}
        <p className={cn(
          'text-sm font-bold w-28 text-right',
          isIncome ? 'text-emerald-600' : 'text-red-500'
        )}>
          {isIncome ? '+' : '−'}{formatCurrency(tx.amount)}
        </p>

        {/* Date */}
        <p className="text-xs text-slate-400 dark:text-slate-500 w-24 text-right">
          {formatDate(tx.date)}
        </p>

        {/* Actions */}
        <ActionButtons
          tx={tx}
          isDeleting={isDeleting}
          onEdit={onEdit}
          onDelete={onDelete}
          onConfirmDelete={onConfirmDelete}
          onCancelDelete={onCancelDelete}
        />
      </div>
    </div>
  );
}

function ActionButtons({ tx, isDeleting, onEdit, onDelete, onConfirmDelete, onCancelDelete }) {
  if (isDeleting) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={() => onConfirmDelete(tx.id)}
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors"
        >
          <LuCheck className="w-3 h-3" /> Excluir
        </button>
        <button
          onClick={onCancelDelete}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors"
          title="Cancelar"
        >
          <LuX className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-0.5">
      <button
        onClick={() => onEdit(tx)}
        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        title="Editar"
      >
        <LuPencil className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => onDelete(tx.id)}
        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors"
        title="Excluir"
      >
        <LuTrash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/* ── Main export ─────────────────────────────────────────────── */
export default function TransactionTable({
  transactions,
  loading,
  onEdit,
  onDelete,
  deletingId,
  onConfirmDelete,
  onCancelDelete,
}) {
  if (loading) {
    return (
      <div className="card overflow-hidden divide-y divide-slate-50 dark:divide-slate-800">
        {[0, 1, 2, 3, 4, 5].map((i) => <SkeletonRow key={i} />)}
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <EmptyState
        icon="💸"
        title="Nenhuma transação encontrada"
        description="Tente ajustar os filtros ou adicione uma nova transação."
      />
    );
  }

  const rowProps = { deletingId, onEdit, onDelete, onConfirmDelete, onCancelDelete };

  return (
    <div className="card overflow-hidden">
      {/* Desktop header */}
      <div className="hidden sm:flex items-center gap-3 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">
        <div className="w-9 flex-shrink-0" />
        <span className="flex-1 text-xs font-semibold text-slate-400 uppercase tracking-wide">Descrição</span>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide w-20 text-center">Tipo</span>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide w-28 text-right">Valor</span>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide w-24 text-right">Data</span>
        <span className="w-[72px]" />
      </div>

      <div className="divide-y divide-slate-50 dark:divide-slate-800">
        {transactions.map((tx) => (
          <TxRow key={tx.id} tx={tx} {...rowProps} />
        ))}
      </div>
    </div>
  );
}
