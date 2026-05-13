import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LuPlus, LuPencil, LuTrash2, LuCheck, LuX,
  LuCreditCard, LuWifi, LuFileText,
} from 'react-icons/lu';
import cardService from '../services/cardService';
import CardInvoiceModal from '../components/cards/CardInvoiceModal';
import { formatCurrency } from '../utils/formatCurrency';
import { useToast } from '../contexts/ToastContext';
import { getApiError } from '../utils/apiError';
import { cn } from '../utils/cn';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import Spinner from '../components/ui/Spinner';

/* ─────────────────────────────── brand config ── */
const BRANDS = {
  visa:      { gradient: 'from-[#1A1F71] to-[#3B4BC8]', label: 'Visa' },
  mastercard:{ gradient: 'from-[#2d2d2d] to-[#4a4a4a]', label: 'Mastercard' },
  elo:       { gradient: 'from-[#3d3d3d] to-[#5a5a5a]', label: 'Elo' },
  amex:      { gradient: 'from-[#016FD0] to-[#0095E8]', label: 'Amex' },
  hipercard: { gradient: 'from-[#B4001E] to-[#E8002D]', label: 'Hipercard' },
  outros:    { gradient: 'from-[#6366F1] to-[#8B5CF6]', label: 'Outros' },
};
const BRAND_OPTIONS = Object.entries(BRANDS).map(([v, { label }]) => ({ value: v, label }));

/* ─────────────────────────────── visual card ── */
function CreditCardVisual({ card, flipped }) {
  const brand = BRANDS[card.brand] ?? BRANDS.outros;
  const pct   = card.limit_amount > 0
    ? Math.min(100, ((card.limit_amount - (card.available_limit ?? card.limit_amount)) / card.limit_amount) * 100)
    : 0;

  return (
    <div className={`bg-gradient-to-br ${brand.gradient} rounded-2xl p-5 text-white relative overflow-hidden select-none w-full aspect-[1.586]`}>
      {/* decorative circles */}
      <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
      <div className="absolute -bottom-12 -left-8 w-48 h-48 rounded-full bg-white/5" />

      {/* top row */}
      <div className="flex items-center justify-between relative z-10">
        <span className="text-xs font-semibold tracking-widest text-white/70 uppercase">{brand.label}</span>
        <LuWifi className="w-5 h-5 text-white/60 rotate-90" />
      </div>

      {/* chip */}
      <div className="mt-4 w-9 h-6 bg-gradient-to-br from-amber-300 to-amber-500 rounded-md relative z-10" />

      {/* number */}
      <p className="mt-3 text-base font-mono tracking-widest relative z-10 text-white/90">
        **** **** **** {card.last_digits || '0000'}
      </p>

      {/* bottom row */}
      <div className="mt-3 flex items-end justify-between relative z-10">
        <div>
          <p className="text-[9px] text-white/50 uppercase tracking-wider">Titular</p>
          <p className="text-sm font-semibold truncate max-w-[140px]">{card.name}</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-white/50 uppercase tracking-wider">Limite</p>
          <p className="text-sm font-semibold">{formatCurrency(card.limit_amount)}</p>
        </div>
      </div>

      {/* usage bar */}
      <div className="mt-3 relative z-10">
        <div className="h-1 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-white/80 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────── card item ── */
function CardItem({ card, onEdit, onDelete, onViewInvoice, deletingId, onConfirmDelete, onCancelDelete }) {
  const isDeleting = deletingId === card.id;
  const avail = card.available_limit ?? card.limit_amount;
  const used  = card.limit_amount - avail;
  const pct   = card.limit_amount > 0 ? (used / card.limit_amount) * 100 : 0;
  const brand = BRANDS[card.brand] ?? BRANDS.outros;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className={cn(
        'card overflow-hidden transition-shadow duration-200',
        !isDeleting && 'hover:shadow-card-hover',
        isDeleting && 'ring-2 ring-red-300 dark:ring-red-500/40'
      )}
    >
      {/* visual card */}
      <div className="p-4">
        <CreditCardVisual card={card} />
      </div>

      {/* info */}
      <div className="px-4 pb-4 space-y-3">
        {/* limit bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-400">Disponível</span>
            <span className={cn('font-semibold', pct > 80 ? 'text-red-500' : pct > 50 ? 'text-amber-500' : 'text-emerald-500')}>
              {formatCurrency(avail)}
            </span>
          </div>
          <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className={cn('h-full rounded-full', pct > 80 ? 'bg-red-400' : pct > 50 ? 'bg-amber-400' : 'bg-emerald-400')}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 mt-1">
            <span>Usado: {formatCurrency(used)}</span>
            <span>Limite: {formatCurrency(card.limit_amount)}</span>
          </div>
        </div>

        {/* dates */}
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span>Fechamento: <strong className="text-slate-600 dark:text-slate-300">dia {card.closing_day}</strong></span>
          <span>Vencimento: <strong className="text-slate-600 dark:text-slate-300">dia {card.due_day}</strong></span>
        </div>

        {/* status + actions */}
        <div className="flex items-center justify-between pt-1">
          <span className={cn(
            'text-xs font-semibold px-2 py-0.5 rounded-full',
            card.is_active !== false
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
              : 'bg-slate-100 text-slate-400'
          )}>
            {card.is_active !== false ? 'Ativo' : 'Inativo'}
          </span>

          {isDeleting ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onConfirmDelete(card.id)}
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
            <div className="flex items-center gap-1">
              <button
                onClick={() => onViewInvoice(card)}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
                title="Ver fatura"
              >
                <LuFileText className="w-3.5 h-3.5" /> Fatura
              </button>
              <button
                onClick={() => onEdit(card)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                title="Editar"
              >
                <LuPencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(card.id)}
                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors"
                title="Excluir"
              >
                <LuTrash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────── form modal ── */
const EMPTY_FORM = { name: '', limit_amount: '', closing_day: '', due_day: '', brand: 'outros', last_digits: '', color: '#6366F1', is_active: true };

function validate(f) {
  const e = {};
  if (!f.name.trim())                     e.name         = 'Nome é obrigatório.';
  if (!f.limit_amount || Number(f.limit_amount) <= 0) e.limit_amount = 'Informe um limite maior que zero.';
  if (!f.closing_day || +f.closing_day < 1 || +f.closing_day > 31) e.closing_day = 'Dia inválido (1–31).';
  if (!f.due_day     || +f.due_day     < 1 || +f.due_day     > 31) e.due_day     = 'Dia inválido (1–31).';
  return e;
}

function CardForm({ card, onSave, onClose, saving }) {
  const isEdit = Boolean(card);
  const [form, setForm]     = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(card
      ? { name: card.name, limit_amount: String(card.limit_amount), closing_day: String(card.closing_day), due_day: String(card.due_day), brand: card.brand || 'outros', last_digits: card.last_digits || '', color: card.color || '#6366F1', is_active: card.is_active !== false }
      : EMPTY_FORM
    );
    setErrors({});
  }, [card]);

  const set = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fieldErrors = validate(form);
    if (Object.keys(fieldErrors).length) { setErrors(fieldErrors); return; }
    onSave({
      name:          form.name.trim(),
      limit_amount:  Number(form.limit_amount),
      closing_day:   Number(form.closing_day),
      due_day:       Number(form.due_day),
      brand:         form.brand,
      last_digits:   form.last_digits.trim() || null,
      color:         form.color,
      is_active:     form.is_active,
    });
  };

  return (
    <Modal open onClose={onClose} title={isEdit ? 'Editar cartão' : 'Novo cartão'}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col flex-1 overflow-hidden">
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

          {/* Name */}
          <div>
            <label className="input-label">Nome do cartão</label>
            <input type="text" placeholder="Ex: Nubank, Inter, C6..." className={cn('input', errors.name && 'border-red-400 focus:ring-red-200')} value={form.name} onChange={(e) => set('name', e.target.value)} autoFocus />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Brand */}
          <div>
            <label className="input-label">Bandeira</label>
            <select className="input" value={form.brand} onChange={(e) => set('brand', e.target.value)}>
              {BRAND_OPTIONS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
          </div>

          {/* Limit + last digits */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Limite (R$)</label>
              <input type="number" placeholder="0,00" min="0.01" step="0.01" className={cn('input', errors.limit_amount && 'border-red-400 focus:ring-red-200')} value={form.limit_amount} onChange={(e) => set('limit_amount', e.target.value)} />
              {errors.limit_amount && <p className="mt-1 text-xs text-red-500">{errors.limit_amount}</p>}
            </div>
            <div>
              <label className="input-label">Últimos 4 dígitos <span className="text-slate-400 font-normal">(opcional)</span></label>
              <input type="text" placeholder="0000" maxLength={4} className="input" value={form.last_digits} onChange={(e) => set('last_digits', e.target.value.replace(/\D/g, ''))} />
            </div>
          </div>

          {/* Closing + due day */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Dia fechamento</label>
              <input type="number" placeholder="15" min={1} max={31} className={cn('input', errors.closing_day && 'border-red-400 focus:ring-red-200')} value={form.closing_day} onChange={(e) => set('closing_day', e.target.value)} />
              {errors.closing_day && <p className="mt-1 text-xs text-red-500">{errors.closing_day}</p>}
            </div>
            <div>
              <label className="input-label">Dia vencimento</label>
              <input type="number" placeholder="22" min={1} max={31} className={cn('input', errors.due_day && 'border-red-400 focus:ring-red-200')} value={form.due_day} onChange={(e) => set('due_day', e.target.value)} />
              {errors.due_day && <p className="mt-1 text-xs text-red-500">{errors.due_day}</p>}
            </div>
          </div>

          {/* Active toggle (edit only) */}
          {isEdit && (
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Cartão ativo</span>
              <button
                type="button"
                onClick={() => set('is_active', !form.is_active)}
                className={cn(
                  'w-10 h-5.5 rounded-full transition-colors duration-200 relative',
                  form.is_active ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'
                )}
                style={{ height: '22px' }}
              >
                <span className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200', form.is_active ? 'translate-x-5' : 'translate-x-0.5')} />
              </button>
            </div>
          )}
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

/* ─────────────────────────────── summary strip ── */
function SummaryStrip({ cards }) {
  const totalLimit = cards.reduce((s, c) => s + Number(c.limit_amount), 0);
  const totalAvail = cards.reduce((s, c) => s + Number(c.available_limit ?? c.limit_amount), 0);
  const totalUsed  = totalLimit - totalAvail;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {[
        { label: 'Limite total',     value: totalLimit, color: 'text-slate-700 dark:text-slate-200' },
        { label: 'Total utilizado',  value: totalUsed,  color: 'text-red-500' },
        { label: 'Total disponível', value: totalAvail, color: 'text-emerald-500' },
      ].map(({ label, value, color }) => (
        <div key={label} className="card px-4 py-3.5">
          <p className="text-xs text-slate-400 font-medium mb-0.5">{label}</p>
          <p className={cn('text-lg font-bold', color)}>{formatCurrency(value)}</p>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────── page ── */
const SkeletonCard = () => (
  <div className="card overflow-hidden animate-pulse">
    <div className="p-4"><div className="skeleton rounded-2xl w-full aspect-[1.586]" /></div>
    <div className="px-4 pb-4 space-y-3">
      <div className="skeleton h-3 rounded w-full" />
      <div className="skeleton h-3 rounded w-3/4" />
    </div>
  </div>
);

export default function Cards() {
  const [cards, setCards]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [deletingId, setDeletingId]  = useState(null);
  const [invoiceCard, setInvoiceCard] = useState(null);
  const toast = useToast();

  const fetchCards = useCallback(async () => {
    setLoading(true);
    try {
      const res = await cardService.getAll();
      setCards(res.data.data ?? []);
    } catch (err) {
      toast.error(getApiError(err, 'Erro ao carregar cartões.'));
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchCards(); }, [fetchCards]);

  const openCreate      = ()     => { setEditingCard(null); setModalOpen(true); };
  const openEdit        = (card) => { setEditingCard(card); setModalOpen(true); };
  const closeModal      = ()     => { setModalOpen(false); setEditingCard(null); };
  const openInvoice     = (card) => setInvoiceCard(card);
  const closeInvoice    = ()     => setInvoiceCard(null);

  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (editingCard) {
        await cardService.update(editingCard.id, data);
        toast.success('Cartão atualizado!');
      } else {
        await cardService.create(data);
        toast.success('Cartão adicionado!');
      }
      closeModal();
      fetchCards();
    } catch (err) {
      toast.error(getApiError(err, 'Erro ao salvar cartão.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRequest  = (id) => setDeletingId(id);
  const handleCancelDelete   = ()   => setDeletingId(null);
  const handleConfirmDelete  = async (id) => {
    try {
      await cardService.remove(id);
      setDeletingId(null);
      setCards((prev) => prev.filter((c) => c.id !== id));
      toast.success('Cartão excluído.');
    } catch (err) {
      toast.error(getApiError(err, 'Erro ao excluir cartão.'));
      setDeletingId(null);
    }
  };

  return (
    <div className="page">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Cartões de Crédito</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {!loading && `${cards.length} ${cards.length === 1 ? 'cartão' : 'cartões'} cadastrado${cards.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <LuPlus className="w-4 h-4" />
          <span>Novo cartão</span>
        </button>
      </div>

      {/* summary */}
      {!loading && cards.length > 0 && <SummaryStrip cards={cards} />}

      {/* grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : cards.length === 0 ? (
        <EmptyState
          icon={<LuCreditCard className="w-10 h-10 text-slate-300" />}
          title="Nenhum cartão cadastrado"
          description="Adicione seus cartões de crédito para controlar o limite e a fatura."
          action={<button onClick={openCreate} className="btn-primary"><LuPlus className="w-4 h-4" /> Adicionar cartão</button>}
        />
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
          layout
        >
          <AnimatePresence>
            {cards.map((card) => (
              <CardItem
                key={card.id}
                card={card}
                onEdit={openEdit}
                onDelete={handleDeleteRequest}
                onViewInvoice={openInvoice}
                deletingId={deletingId}
                onConfirmDelete={handleConfirmDelete}
                onCancelDelete={handleCancelDelete}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* card form modal */}
      {modalOpen && (
        <CardForm
          card={editingCard}
          onSave={handleSave}
          onClose={closeModal}
          saving={saving}
        />
      )}

      {/* invoice modal */}
      <AnimatePresence>
        {invoiceCard && (
          <CardInvoiceModal card={invoiceCard} onClose={closeInvoice} />
        )}
      </AnimatePresence>
    </div>
  );
}

