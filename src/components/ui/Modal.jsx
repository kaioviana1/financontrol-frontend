import { useEffect } from 'react';
import { LuX } from 'react-icons/lu';
import { cn } from '../../utils/cn';

const SIZE = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl' };

export default function Modal({ open, onClose, title, size = 'md', children, className = '' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={cn(
          'bg-white dark:bg-slate-900 w-full flex flex-col',
          'rounded-t-3xl sm:rounded-2xl shadow-2xl',
          'max-h-[93dvh] sm:max-h-[90vh]',
          SIZE[size] || SIZE.md,
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle — mobile only */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>

        {title && (
          <div className="flex items-center justify-between px-4 sm:px-6 pt-3 sm:pt-5 pb-3 sm:pb-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              aria-label="Fechar"
            >
              <LuX className="w-5 h-5" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
