import { useState, useEffect } from 'react';
import { LuArrowUpRight, LuArrowDownLeft } from 'react-icons/lu';
import { cn } from '../../utils/cn';
import { todayInputDate } from '../../utils/formatDate';
import Modal from '../ui/Modal';
import Spinner from '../ui/Spinner';

const EMPTY = { type: 'expense', description: '', amount: '', date: todayInputDate(), category_id: '' };

function validate(form) {
  const errors = {};
  if (!form.description.trim())            errors.description = 'Descrição é obrigatória.';
  else if (form.description.trim().length < 2) errors.description = 'Mínimo 2 caracteres.';
  if (!form.amount || Number(form.amount) <= 0) errors.amount = 'Informe um valor maior que zero.';
  if (!form.date)                          errors.date = 'Data é obrigatória.';
  return errors;
}

export default function TransactionForm({ transaction, categories, onSave, onClose, saving }) {
  const isEdit = Boolean(transaction);
  const [form, setForm]     = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(transaction
      ? {
          type:        transaction.type,
          description: transaction.description,
          amount:      String(transaction.amount),
          date:        transaction.date?.split('T')[0] ?? todayInputDate(),
          category_id: transaction.category_id ?? '',
        }
      : EMPTY
    );
    setErrors({});
  }, [transaction]);

  const set = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'type') next.category_id = '';
      return next;
    });
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const filteredCategories = categories.filter((c) => c.type === form.type);

  const handleSubmit = (e) => {
    e.preventDefault();
    const fieldErrors = validate(form);
    if (Object.keys(fieldErrors).length) { setErrors(fieldErrors); return; }
    onSave({
      type:        form.type,
      description: form.description.trim(),
      amount:      Number(form.amount),
      date:        form.date,
      category_id: form.category_id ? Number(form.category_id) : null,
    });
  };

  const isIncome = form.type === 'income';

  return (
    <Modal open onClose={onClose} title={isEdit ? 'Editar transação' : 'Nova transação'}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col flex-1 overflow-hidden">
        <div className="overflow-y-auto flex-1 px-4 sm:px-6 py-4 sm:py-5 space-y-4">

          {/* Type toggle */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {[
              { val: 'income',  label: 'Receita',  Icon: LuArrowUpRight,  active: 'text-emerald-600' },
              { val: 'expense', label: 'Despesa',   Icon: LuArrowDownLeft, active: 'text-red-500' },
            ].map(({ val, label, Icon, active }) => (
              <button
                key={val}
                type="button"
                onClick={() => set('type', val)}
                className={cn(
                  'flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150',
                  form.type === val
                    ? `bg-white dark:bg-slate-700 shadow-sm ${active}`
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Description */}
          <div>
            <label className="input-label">Descrição</label>
            <input
              type="text"
              placeholder="Ex: Salário, Aluguel, Mercado..."
              autoFocus
              className={cn('input', errors.description && 'border-red-400 focus:ring-red-200 focus:border-red-400')}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />
            {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
          </div>

          {/* Amount + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Valor (R$)</label>
              <input
                type="number"
                placeholder="0,00"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                className={cn('input', errors.amount && 'border-red-400 focus:ring-red-200 focus:border-red-400')}
                value={form.amount}
                onChange={(e) => set('amount', e.target.value)}
              />
              {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount}</p>}
            </div>
            <div>
              <label className="input-label">Data</label>
              <input
                type="date"
                className={cn('input', errors.date && 'border-red-400 focus:ring-red-200 focus:border-red-400')}
                value={form.date}
                onChange={(e) => set('date', e.target.value)}
              />
              {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="input-label">
              Categoria{' '}
              <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <select
              className="input"
              value={form.category_id}
              onChange={(e) => set('category_id', e.target.value)}
            >
              <option value="">Sem categoria</option>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-4 sm:px-6 pb-5 sm:pb-5 pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-2.5',
              'rounded-xl font-semibold text-sm transition-all duration-150',
              'active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed',
              isIncome
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            )}
          >
            {saving ? <Spinner /> : (isEdit ? 'Salvar alterações' : 'Adicionar')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
