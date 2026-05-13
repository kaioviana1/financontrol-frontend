import { useState, useEffect, useCallback } from 'react';
import { LuChevronLeft, LuChevronRight, LuCircleCheck, LuCircle, LuCreditCard, LuX } from 'react-icons/lu';
import { motion, AnimatePresence } from 'framer-motion';
import cardService from '../../services/cardService';
import installmentService from '../../services/installmentService';
import { formatCurrency } from '../../utils/formatCurrency';
import { useToast } from '../../contexts/ToastContext';
import { getApiError } from '../../utils/apiError';
import { cn } from '../../utils/cn';

const PT_MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

const BRAND_COLORS = {
  visa:       'from-[#1A1F71] to-[#3B4BC8]',
  mastercard: 'from-[#2d2d2d] to-[#4a4a4a]',
  elo:        'from-[#3d3d3d] to-[#5a5a5a]',
  amex:       'from-[#016FD0] to-[#0095E8]',
  hipercard:  'from-[#B4001E] to-[#E8002D]',
  outros:     'from-[#6366F1] to-[#8B5CF6]',
};

export default function CardInvoiceModal({ card, onClose }) {
  const now = new Date();
  const [year, setYear]     = useState(now.getFullYear());
  const [month, setMonth]   = useState(now.getMonth() + 1);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying]   = useState(null);
  const toast = useToast();

  const fetchInvoice = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await cardService.getInvoice(card.id, { year, month });
      setInvoice(data.data.invoice);
    } catch (err) {
      toast.error(getApiError(err, 'Erro ao carregar fatura.'));
    } finally {
      setLoading(false);
    }
  }, [card.id, year, month]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchInvoice(); }, [fetchInvoice]);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  const handlePay = async (item) => {
    if (item.is_paid) {
      setPaying(item.id);
      try {
        await installmentService.unpay(item.id);
        toast.success('Pagamento desfeito.');
        fetchInvoice();
      } catch (err) {
        toast.error(getApiError(err, 'Erro ao desfazer pagamento.'));
      } finally {
        setPaying(null);
      }
    } else {
      setPaying(item.id);
      try {
        await installmentService.pay(item.id);
        toast.success('Parcela paga!');
        fetchInvoice();
      } catch (err) {
        toast.error(getApiError(err, 'Erro ao registrar pagamento.'));
      } finally {
        setPaying(null);
      }
    }
  };

  const gradient = BRAND_COLORS[card.brand] ?? BRAND_COLORS.outros;
  const paidItems   = invoice?.items?.filter((i) => i.is_paid)   ?? [];
  const unpaidItems = invoice?.items?.filter((i) => !i.is_paid)  ?? [];

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.2 }}
        className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header gradient */}
        <div className={`bg-gradient-to-r ${gradient} p-5`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <LuCreditCard className="w-5 h-5 text-white/80" />
              <div>
                <p className="text-white font-bold text-sm leading-tight">{card.name}</p>
                {card.last_digits && (
                  <p className="text-white/60 text-xs">···· {card.last_digits}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <LuX className="w-4 h-4" />
            </button>
          </div>

          {/* Month navigator */}
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <LuChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-center">
              <p className="text-white font-semibold text-sm capitalize">
                {PT_MONTHS[month - 1]} {year}
              </p>
              <p className="text-white/60 text-xs">Fatura</p>
            </div>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <LuChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Total */}
          {!loading && invoice && (
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-white/60 text-xs">Total da fatura</p>
                <p className="text-white text-2xl font-bold">{formatCurrency(invoice.total)}</p>
              </div>
              <div className="text-right">
                <p className="text-white/60 text-xs">{invoice.items?.length ?? 0} {(invoice.items?.length ?? 0) === 1 ? 'compra' : 'compras'}</p>
                <p className="text-emerald-300 text-xs font-medium">{paidItems.length} paga{paidItems.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-5 space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-8 h-8 skeleton rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="skeleton h-3 rounded w-3/4" />
                    <div className="skeleton h-2.5 rounded w-1/2" />
                  </div>
                  <div className="skeleton h-4 rounded w-20 flex-shrink-0" />
                </div>
              ))}
            </div>
          ) : (invoice?.items?.length ?? 0) === 0 ? (
            <div className="py-14 flex flex-col items-center gap-2 text-slate-400">
              <span className="text-3xl select-none">🎉</span>
              <p className="text-sm font-medium">Nenhuma compra neste mês.</p>
            </div>
          ) : (
            <div className="p-4 space-y-1">
              {/* Unpaid items first */}
              {unpaidItems.length > 0 && (
                <div className="mb-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-2">
                    Pendentes ({unpaidItems.length})
                  </p>
                  {unpaidItems.map((item) => (
                    <InvoiceRow
                      key={item.id}
                      item={item}
                      isPaying={paying === item.id}
                      onToggle={() => handlePay(item)}
                    />
                  ))}
                </div>
              )}

              {paidItems.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-2 mt-3">
                    Pagas ({paidItems.length})
                  </p>
                  {paidItems.map((item) => (
                    <InvoiceRow
                      key={item.id}
                      item={item}
                      isPaying={paying === item.id}
                      onToggle={() => handlePay(item)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && invoice && (invoice.items?.length ?? 0) > 0 && (
          <div className="border-t border-slate-100 dark:border-slate-800 px-5 py-3.5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Pago</p>
              <p className="text-sm font-bold text-emerald-500">
                {formatCurrency(paidItems.reduce((s, i) => s + Number(i.installment_value), 0))}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Pendente</p>
              <p className="text-sm font-bold text-red-500">
                {formatCurrency(invoice.total)}
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function InvoiceRow({ item, isPaying, onToggle }) {
  return (
    <div className={cn(
      'flex items-center gap-3 px-2 py-2.5 rounded-xl transition-colors',
      item.is_paid
        ? 'opacity-60'
        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
    )}>
      <button
        onClick={onToggle}
        disabled={isPaying}
        className="flex-shrink-0 transition-transform active:scale-90"
        title={item.is_paid ? 'Desfazer pagamento' : 'Marcar como pago'}
      >
        {isPaying ? (
          <div className="w-5 h-5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
        ) : item.is_paid ? (
          <LuCircleCheck className="w-5 h-5 text-emerald-500" />
        ) : (
          <LuCircle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm font-medium truncate',
          item.is_paid
            ? 'line-through text-slate-400'
            : 'text-slate-800 dark:text-slate-100'
        )}>
          {item.description}
        </p>
        <p className="text-xs text-slate-400">
          Parcela {item.installment_number} de {item.installment_count}
        </p>
      </div>

      <p className={cn(
        'text-sm font-bold flex-shrink-0',
        item.is_paid ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'
      )}>
        {formatCurrency(item.installment_value)}
      </p>
    </div>
  );
}
