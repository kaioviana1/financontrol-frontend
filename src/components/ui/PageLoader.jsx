import { LuTrendingUp } from 'react-icons/lu';

export default function PageLoader() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 min-h-[60vh]">
      <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
        <LuTrendingUp className="w-6 h-6 text-slate-900" />
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
      </div>
    </div>
  );
}
