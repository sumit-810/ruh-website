import { cn } from '@/lib/utils';

/** Scent notes as chips — rendered only once the perfumer's notes are confirmed in site.config.js. */
export function NotesBlock({ product, className }: { product: any; className?: string }) {
  const n = product?.scent?.notes;
  if (!n) return null;
  const rows: [string, string[] | undefined, string][] = [
    ['Top', n.top, 'bg-apricot'],
    ['Heart', n.heart, 'bg-rose'],
    ['Base', n.base, 'bg-clay'],
  ];
  return (
    <div className={cn('grid gap-3', className)}>
      {rows.map(([label, list, dot]) =>
        list?.length ? (
          <div key={label} className="flex flex-wrap items-center gap-2">
            <span className="eyebrow w-14">{label}</span>
            {list.map((x) => (
              <span key={x} className="inline-flex items-center gap-2 rounded-full border border-cocoa/15 bg-porcelain/60 px-3 py-1.5 text-sm">
                <i className={cn('size-2 rounded-full', dot)} />
                {x}
              </span>
            ))}
          </div>
        ) : null,
      )}
    </div>
  );
}
