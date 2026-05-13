import { LuLoader } from 'react-icons/lu';
import { cn } from '../../utils/cn';

export default function Spinner({ size = 'md', className = '' }) {
  const sizeClass = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-5 h-5' }[size] || 'w-4 h-4';
  return <LuLoader className={cn('animate-spin', sizeClass, className)} />;
}
