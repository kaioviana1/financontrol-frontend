import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LuPlus, LuPencil, LuTrash2, LuCheck, LuX,
  LuCreditCard, LuCircleCheck, LuCircle, LuListChecks,
} from 'react-icons/lu';
import installmentService from '../services/installmentService';
import cardService from '../services/cardService';
import { formatCurrency } from '../utils/formatCurrency';
import { todayInputDate } from '../utils/formatDate';
import { useToast } from '../contexts/ToastContext';
import { getApiError } from '../utils/apiError';
import { cn } from '../utils/cn';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import Spinner from '../components/ui/Spinner';

/* ── helpers ── */
const BRAND_COLORS = {
  visa:       'from-[#1A1F71] to-[#3B4BC8]',
  mastercard: 'from-[#2d2d2d] to-[#4a4a4a]',
  elo:        'from-[#3d3d3d] to-[#5a5a5a]',
  amex:       'from-[#016FD0] to-[#0095E8]',
  hipercard:  'from-[#B4001E] to-[#E8002D]',
  outros:     'from-[#6366F1] to-[#8B5CF6]',
};

const thisMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
};

/* ── form validation ── */
function validate(f) {
  const e = {};
  if (!f.card_id)                               e.card_id           = 'Selecione um cartão.';
  if (!f.description.trim())                    e.description       = 'Descrição é obrigatória.';
  if (!f.total_amount || Number(f.total_amount) <= 0) e.total_amount = 'Informe um valor maior que zero.';
  if (!f.installment_count || +f.installment_count < 2) e.installment_count = 'Mínimo 2 parcelas.';
  if (+f.installment_count > 48)                e.installment_count = 'Máximo 48 parcelas.';
  if (!f.start_date)                            e.start_date        = 'Data é obrigatória.';
  return e;
}

const EMPTY_FORM = { card_id: '', description: '', total_amount: '', installment_count: '', start_date: thisMonth() };

/* ── InstallmentForm ── */
function InstallmentForm({ installment, cards, onSave, onClose, saving }) {
  const isEdit = Boolean(installment);
  const [form, setForm]     = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (installment) {
      const raw = installment.start_date;
      const datePart = raw instanceof Date ? raw.toISOString().split('T')[0] : String(raw).split('T')[0];
      setForm({
        card_id:           String(installment.card_id),
        description:       installment.description,
        total_amount:      String(installment.total_amount),
        installment_count: String(installment.installment_count),
        start_date:        datePart,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [installment]);

  const set = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
  };

  const parcela = form.total_amount && form.installment_count && +form.installment_count >= 2
    ? (Number(form.total_amount) / Number(form.installment_count)).toFixed(2)
    : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const fieldErrors = validate(form);
    if (Object.keys(fieldErrors).length) { setErrors(fieldErrors); return; }
    onSave({
      card_id:           Number(form.card_id),
      description:       form.description.trim(),
      total_amount:      Number(form.total_amount),
      installment_count: Number(form.installment_count),
      start_date:        form.start_date,
    });
  };

  return (
    <Modal open onClose={onClose} title={isEdit ? 'Editar parcelamento' : 'Novo parcelamento'}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col flex-1 overflow-hidden">
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

          {/* Cartão */}
          <div>
            <label className="input-label">Cartão</label>
            <select
              className={cn('input', errors.card_id && 'border-red-400 focus:ring-red-200')}
              value={form.card_id}
              onChange={(e) => set('card_id', e.target.value)}
              disabled={isEdit}
            >
              <option value="">Selecione um cartão</option>
              {cards.map((c) => (
                <option key={c.id} value={c.id}>{c.name} {c.last_digits ? `····${c.last_digits}` : ''}</option>
              ))}
            </select>
            {errors.card_id && <p className="mt-1 text-xs text-red-500">{errors.card_id}</p>}
            {isEdit && <p className="mt-1 text-xs text-slate-400">O cartão não pode ser alterado após criação.</p>}
          </div>

          {/* Descrição */}
          <div>
            <label className="input-label">Descrição</label>
            <input
              type="text"
              placeholder="Ex: iPhone 15, Notebook, TV..."
              autoFocus
              className={cn('input', errors.description && 'border-red-400 focus:ring-red-200')}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />
            {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
          </div>

          {/* Valor total + parcelas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Valor total (R$)</label>
              <input
                type="number"
                placeholder="0,00"
                min="0.01"
                step="0.01"
                className={cn('input', errors.total_amount && 'border-red-400 focus:ring-red-200')}
                value={form.total_amount}
                onChange={(e) => set('total_amount', e.target.value)}
              />
              {errors.total_amount && <p className="mt-1 text-xs text-red-500">{errors.total_amount}</p>}
            </div>
            <div>
              <label className="input-label">Nº de parcelas</label>
              <input
                type="number"
                placeholder="Ex: 12"
                min="2"
                max="48"
                className={cn('input', errors.installment_count && 'border-red-400 focus:ring-red-200')}
                value={form.installment_count}
                onChange={(e) => set('installment_count', e.target.value)}
              />
              {errors.installment_count && <p className="mt-1 text-xs text-red-500">{errors.installment_count}</p>}
            </div>
          </div>

          {/* Preview de valor por parcela */}
          {parcela && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl">
              <LuCreditCard className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              <p className="text-sm text-indigo-700 dark:text-indigo-300">
                <span className="font-semibold">{form.installment_count}x</span> de{' '}
                <span className="font-bold">{formatCurrency(Number(parcela))}</span>
              </p>
            </div>
          )}

          {/* Mês da 1ª parcela */}
          <div>
            <label className="input-label">Mês da 1ª parcela</label>
            <input
              type="date"
              className={cn('input', errors.start_date && 'border-red-400 focus:ring-red-200')}
              value={form.start_date}
              onChange={(e) => set('start_date', e.target.value)}
            />
            {errors.start_date && <p className="mt-1 text-xs text-red-500">{errors.start_date}</p>}
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? <Spinner /> : (isEdit ? 'Salvar' : 'Adicionar')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ── InstallmentCard ── */
function InstallmentCard({ item, onEdit, onDelete, onPay, onUnpay, deletingId, onConfirmDelete, onCancelDelete }) {
  const isDeleting  = deletingId === item.id;
  const pct         = item.installment_count > 0
    ? Math.round((item.paid_count / item.installment_count) * 100)
    : 0;
  const isDone      = item.paid_count >= item.installment_count;
  const gradient    = BRAND_COLORS[item.card_brand] ?? BRAND_COLORS.outros;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className={cn(
        'card overflow-hidden',
        isDeleting && 'ring-2 ring-red-300 dark:ring-red-500/40'
      )}
    >
      {/* card header strip */}
      <div className={`bg-gradient-to-r ${gradient} px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <LuCreditCard className="w-4 h-4 text-white/80" />
          <span className="text-xs font-semibold text-white/90 truncate max-w-[140px]">
            {item.card_name} {item.card_brand !== 'outros' ? `· ${item.card_brand}` : ''}
          </span>
        </div>
        {isDone && (
          <span className="text-[10px] font-bold text-white/90 bg-white/20 px-2 py-0.5 rounded-full">
            Quitado
          </span>
        )}
      </div>

      <div className="px-4 py-4 space-y-3">
        {/* description + amount */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
              {item.description}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Total: {formatCurrency(item.total_amount)}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
              {formatCurrency(item.installment_value)}<span className="text-xs font-normal text-slate-400">/mês</span>
            </p>
          </div>
        </div>

        {/* progress bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-500 dark:text-slate-400">
              {item.paid_count} de {item.installment_count} parcelas pagas
            </span>
            <span className={cn('font-semibold', isDone ? 'text-emerald-500' : 'text-indigo-500')}>
              {pct}%
            </span>
          </div>
          <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className={cn('h-full rounded-full', isDone ? 'bg-emerald-400' : 'bg-indigo-400')}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* remaining */}
        {!isDone && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Restante</span>
            <span className="font-semibold text-red-500">
              {formatCurrency(item.remaining_amount)}
              <span className="text-slate-400 font-normal ml-1">({item.remaining_count}x)</span>
            </span>
          </div>
        )}

        {/* actions */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-50 dark:border-slate-800">
          {isDeleting ? (
            <div className="flex items-center gap-1.5 w-full justify-end">
              <button
                onClick={() => onConfirmDelete(item.id)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors"
              >
                <LuCheck className="w-3 h-3" /> Confirmar
              </button>
              <button
                onClick={onCancelDelete}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors"
              >
                <LuX className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <>
              {/* pay / unpay */}
              <div className="flex items-center gap-1">
                {!isDone && (
                  <button
                    onClick={() => onPay(item.id)}
                    title="Marcar próxima parcela como paga"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
                  >
                    <LuCircleCheck className="w-3.5 h-3.5" /> Pagar parcela
                  </button>
                )}
                {item.paid_count > 0 && (
                  <button
                    onClick={() => onUnpay(item.id)}
                    title="Desfazer último pagamento"
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <LuCircle className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* edit / delete */}
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => onEdit(item)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  title="Editar"
                >
                  <LuPencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors"
                  title="Excluir"
                >
                  <LuTrash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Skeleton ── */
const SkeletonCard = () => (
  <div className="card overflow-hidden animate-pulse">
    <div className="h-10 skeleton" />
    <div className="px-4 py-4 space-y-3">
      <div className="skeleton h-4 rounded w-3/4" />
      <div className="skeleton h-3 rounded w-1/2" />
      <div className="skeleton h-2 rounded w-full" />
    </div>
  </div>
);

/* ── Page ── */
export default function Installments() {
  const [items, setItems]         = useState([]);
  const [cards, setCards]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [filterCard, setFilterCard] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const toast = useToast();

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterCard)   params.card_id = filterCard;
      if (filterActive) params.active  = filterActive;
      const [instRes, cardRes] = await Promise.all([
        installmentService.getAll(params),
        cardService.getAll(),
      ]);
      setItems(instRes.data.data ?? []);
      setCards(cardRes.data.data ?? []);
    } catch (err) {
      toast.error(getApiError(err, 'Erro ao carregar parcelamentos.'));
    } finally {
      setLoading(false);
    }
  }, [filterCard, filterActive]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openCreate = ()     => { setEditing(null); setModalOpen(true); };
  const openEdit   = (item) => { setEditing(item); setModalOpen(true); };
  const closeModal = ()     => { setModalOpen(false); setEditing(null); };

  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (editing) {
        await installmentService.update(editing.id, data);
        toast.success('Parcelamento atualizado!');
      } else {
        await installmentService.create(data);
        toast.success('Parcelamento adicionado!');
      }
      closeModal();
      fetchAll();
    } catch (err) {
      toast.error(getApiError(err, 'Erro ao salvar parcelamento.'));
    } finally {
      setSaving(false);
    }
  };

  const handlePay = async (id) => {
    try {
      await installmentService.pay(id);
      setItems((prev) => prev.map((i) =>
        i.id === id
          ? { ...i, paid_count: i.paid_count + 1, remaining_count: i.remaining_count - 1, remaining_amount: Number((Number(i.remaining_amount) - Number(i.installment_value)).toFixed(2)) }
          : i
      ));
      toast.success('Parcela marcada como paga!');
    } catch (err) {
      toast.error(getApiError(err, 'Erro ao registrar pagamento.'));
    }
  };

  const handleUnpay = async (id) => {
    try {
      await installmentService.unpay(id);
      setItems((prev) => prev.map((i) =>
        i.id === id
          ? { ...i, paid_count: i.paid_count - 1, remaining_count: i.remaining_count + 1, remaining_amount: Number((Number(i.remaining_amount) + Number(i.installment_value)).toFixed(2)) }
          : i
      ));
      toast.success('Pagamento desfeito.');
    } catch (err) {
      toast.error(getApiError(err, 'Erro ao desfazer pagamento.'));
    }
  };

  const handleDeleteRequest  = (id) => setDeletingId(id);
  const handleCancelDelete   = ()   => setDeletingId(null);
  const handleConfirmDelete  = async (id) => {
    try {
      await installmentService.remove(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      setDeletingId(null);
      toast.success('Parcelamento excluído.');
    } catch (err) {
      toast.error(getApiError(err, 'Erro ao excluir.'));
      setDeletingId(null);
    }
  };

  const totalRestante = items.reduce((s, i) => s + Number(i.remaining_amount), 0);
  const totalPago     = items.reduce((s, i) => s + (Number(i.total_amount) - Number(i.remaining_amount)), 0);
  const ativos        = items.filter((i) => i.paid_count < i.installment_count).length;

  return (
    <div className="page">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Parcelamentos</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {!loading && `${items.length} parcelamento${items.length !== 1 ? 's' : ''} · ${ativos} ativo${ativos !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <LuPlus className="w-4 h-4" />
          <span>Novo parcelamento</span>
        </button>
      </div>

      {/* summary */}
      {!loading && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Total parcelado',  value: items.reduce((s, i) => s + Number(i.total_amount), 0), color: 'text-slate-700 dark:text-slate-200' },
            { label: 'Total pago',       value: totalPago,    color: 'text-emerald-500' },
            { label: 'Total restante',   value: totalRestante, color: 'text-red-500' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card px-4 py-3.5">
              <p className="text-xs text-slate-400 font-medium mb-0.5">{label}</p>
              <p className={cn('text-lg font-bold', color)}>{formatCurrency(value)}</p>
            </div>
          ))}
        </div>
      )}

      {/* filters */}
      {!loading && cards.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <select
            className="input !w-auto text-sm"
            value={filterCard}
            onChange={(e) => setFilterCard(e.target.value)}
          >
            <option value="">Todos os cartões</option>
            {cards.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select
            className="input !w-auto text-sm"
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
          >
            <option value="">Todos os status</option>
            <option value="true">Apenas ativos</option>
            <option value="false">Apenas quitados</option>
          </select>
        </div>
      )}

      {/* list */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<LuListChecks className="w-10 h-10 text-slate-300" />}
          title="Nenhum parcelamento encontrado"
          description="Registre compras parceladas no cartão para acompanhar o progresso."
          action={<button onClick={openCreate} className="btn-primary"><LuPlus className="w-4 h-4" /> Adicionar parcelamento</button>}
        />
      ) : (
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5" layout>
          <AnimatePresence>
            {items.map((item) => (
              <InstallmentCard
                key={item.id}
                item={item}
                onEdit={openEdit}
                onDelete={handleDeleteRequest}
                onPay={handlePay}
                onUnpay={handleUnpay}
                deletingId={deletingId}
                onConfirmDelete={handleConfirmDelete}
                onCancelDelete={handleCancelDelete}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {modalOpen && (
        <InstallmentForm
          installment={editing}
          cards={cards}
          onSave={handleSave}
          onClose={closeModal}
          saving={saving}
        />
      )}
    </div>
  );
}
