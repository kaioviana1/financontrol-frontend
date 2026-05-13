import { useState, useEffect } from 'react';
import { LuArrowUpRight, LuArrowDownLeft } from 'react-icons/lu';
import { cn } from '../../utils/cn';
import Modal from '../ui/Modal';
import Spinner from '../ui/Spinner';

const COLOR_OPTIONS = [
  '#f87171', '#fb923c', '#fbbf24', '#a3e635',
  '#34d399', '#22d3ee', '#60a5fa', '#818cf8',
  '#c084fc', '#f472b6', '#94a3b8', '#80f96d',
  '#ef4444', '#f97316', '#eab308', '#84cc16',
  '#10b981', '#06b6d4', '#3b82f6', '#6366f1',
];

const ICON_OPTIONS = [
  '🍕', '🛒', '🏠', '🚗', '💊', '🎬', '✈️', '👔',
  '📱', '💡', '🎮', '📚', '💰', '💼', '📈', '🎁',
  '🏦', '💵', '🤝', '🏆', '⚽', '🎵', '🐾', '🌿',
  '☕', '🍺', '👶', '💅', '🏋️', '🎓', '🐶', '🌎',
];

const EMPTY = { type: 'expense', name: '', color: '#60a5fa', icon: '' };

function validate(form) {
  const errors = {};
  if (!form.name.trim())           errors.name = 'Nome é obrigatório.';
  else if (form.name.trim().length < 2) errors.name = 'Mínimo 2 caracteres.';
  return errors;
}

export default function CategoryForm({ category, onSave, onClose, saving }) {
  const isEdit = Boolean(category);
  const [form, setForm]     = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(category
      ? { type: category.type, name: category.name, color: category.color || '#60a5fa', icon: category.icon || '' }
      : EMPTY
    );
    setErrors({});
  }, [category]);

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fieldErrors = validate(form);
    if (Object.keys(fieldErrors).length) { setErrors(fieldErrors); return; }
    onSave({ name: form.name.trim(), type: form.type, color: form.color, icon: form.icon.trim() || null });
  };

  return (
    <Modal open onClose={onClose} title={isEdit ? 'Editar categoria' : 'Nova categoria'}>
      <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

        {/* Type toggle */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          {[
            { val: 'income',  label: 'Receita', Icon: LuArrowUpRight,  active: 'text-emerald-600' },
            { val: 'expense', label: 'Despesa', Icon: LuArrowDownLeft, active: 'text-red-500' },
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
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* Preview + Name */}
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 transition-colors duration-150"
            style={{ background: form.color + '22' }}
          >
            {form.icon
              ? <span>{form.icon}</span>
              : <span className="w-4 h-4 rounded-full" style={{ background: form.color }} />
            }
          </div>
          <div className="flex-1">
            <label className="input-label">Nome da categoria</label>
            <input
              type="text"
              placeholder="Ex: Alimentação, Salário..."
              autoFocus
              className={cn('input', errors.name && 'border-red-400 focus:ring-red-200 focus:border-red-400')}
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>
        </div>

        {/* Color palette */}
        <div>
          <label className="input-label mb-2 block">Cor</label>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => set('color', c)}
                title={c}
                className={cn(
                  'w-7 h-7 rounded-lg transition-all duration-100 hover:scale-110',
                  form.color === c && 'ring-2 ring-offset-2 ring-slate-400 scale-110'
                )}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        {/* Icon picker */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="input-label mb-0">
              Ícone <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            {form.icon && (
              <button
                type="button"
                onClick={() => set('icon', '')}
                className="text-xs text-red-400 hover:text-red-500 font-medium"
              >
                Remover
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
            {ICON_OPTIONS.map((ic) => (
              <button
                key={ic}
                type="button"
                onClick={() => set('icon', ic)}
                className={cn(
                  'w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all duration-100',
                  form.icon === ic
                    ? 'bg-white dark:bg-slate-700 shadow-sm ring-2 ring-primary/50 scale-110'
                    : 'hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm'
                )}
              >
                {ic}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex gap-3 px-6 pb-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="btn-primary flex-1"
        >
          {saving ? <Spinner /> : (isEdit ? 'Salvar' : 'Criar')}
        </button>
      </div>
    </Modal>
  );
}
