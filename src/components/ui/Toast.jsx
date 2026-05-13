import { LuCircleCheckBig, LuCircleX, LuTriangleAlert, LuInfo, LuX } from 'react-icons/lu';
import { cn } from '../../utils/cn';

const VARIANTS = {
  success: {
    wrapper: 'bg-white border-l-4 border-emerald-500',
    icon:    LuCircleCheckBig,
    iconCls: 'text-emerald-500',
    title:   'text-slate-900',
    msg:     'text-slate-500',
  },
  error: {
    wrapper: 'bg-white border-l-4 border-red-500',
    icon:    LuCircleX,
    iconCls: 'text-red-500',
    title:   'text-slate-900',
    msg:     'text-slate-500',
  },
  warning: {
    wrapper: 'bg-white border-l-4 border-amber-400',
    icon:    LuTriangleAlert,
    iconCls: 'text-amber-400',
    title:   'text-slate-900',
    msg:     'text-slate-500',
  },
  info: {
    wrapper: 'bg-white border-l-4 border-blue-500',
    icon:    LuInfo,
    iconCls: 'text-blue-500',
    title:   'text-slate-900',
    msg:     'text-slate-500',
  },
};

function ToastItem({ toast, onDismiss }) {
  const v = VARIANTS[toast.type] || VARIANTS.info;
  const Icon = v.icon;

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 pl-4 pr-3 py-3.5',
        'rounded-2xl shadow-lg min-w-[280px] max-w-[360px]',
        'toast-enter',
        v.wrapper
      )}
    >
      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', v.iconCls)} />

      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className={cn('text-sm font-bold leading-tight', v.title)}>{toast.title}</p>
        )}
        <p className={cn('text-sm leading-snug', v.msg, toast.title && 'mt-0.5')}>
          {toast.message}
        </p>
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0 -mr-1"
        aria-label="Fechar"
      >
        <LuX className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-4 sm:right-5 z-[200] flex flex-col gap-2 items-end"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
