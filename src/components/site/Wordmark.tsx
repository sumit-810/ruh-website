import { wordmarkSvg } from '@/data/brand.js';
import { cn } from '@/lib/utils';

/** GENTLE COMPANY wordmark (vector outlines, inherits currentColor). */
export function Wordmark({ className }: { className?: string }) {
  return <span className={cn('block [&_svg]:h-full [&_svg]:w-auto', className)} aria-hidden="true" dangerouslySetInnerHTML={{ __html: wordmarkSvg }} />;
}
