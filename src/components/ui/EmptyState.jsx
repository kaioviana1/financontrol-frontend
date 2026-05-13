export default function EmptyState({ icon, title, description, action, className = '' }) {
  return (
    <div className={`card p-12 flex flex-col items-center justify-center gap-3 text-slate-400 ${className}`}>
      {icon && <span className="select-none">{icon}</span>}
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 text-center">{title}</p>
      {description && (
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center max-w-xs leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
