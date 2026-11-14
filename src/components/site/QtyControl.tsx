import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export function QtyControl({ value, onChange, max, label, large = false }: { value: number; onChange: (v: number) => void; max: number; label?: string; large?: boolean }) {
  const btn = 'flex h-full w-10 items-center justify-center disabled:opacity-30 cursor-pointer';
  return (
    <div className={cn('inline-flex items-center rounded-full border border-stone', large ? 'h-12' : 'h-9')}>
      <button type="button" className={btn} onClick={() => onChange(Math.max(1, value - 1))} disabled={value <= 1} aria-label={`Decrease quantity${label ? ` of ${label}` : ''}`}>
        <Minus className="size-3.5" strokeWidth={1.4} />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={max}
        value={value}
        onChange={(e) => onChange(Math.min(max, Math.max(1, parseInt(e.target.value, 10) || 1)))}
        className="w-8 bg-transparent text-center text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        aria-label={`Quantity${label ? ` of ${label}` : ''}`}
      />
      <button type="button" className={btn} onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`Increase quantity${label ? ` of ${label}` : ''}`}>
        <Plus className="size-3.5" strokeWidth={1.4} />
      </button>
    </div>
  );
}
