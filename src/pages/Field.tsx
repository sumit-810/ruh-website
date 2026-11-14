import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Labelled field with an error slot. */
export function Field({ id, label, error, className, children }: { id: string; label: string; error?: string; className?: string; children: ReactNode }) {
  return (
    <div className={cn('grid gap-1.5', className)}>
      <label htmlFor={id} className="px-1 text-xs tracking-[0.08em] text-cocoa-2 uppercase">
        {label}
      </label>
      {children}
      <span id={`${id}-err`} className="px-1 text-xs text-error" aria-live="polite">
        {error}
      </span>
    </div>
  );
}
