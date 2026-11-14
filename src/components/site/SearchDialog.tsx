import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { search, allItems, itemUrl, statusOf } from '@/lib/catalog.js';
import { thumb } from './Picture';
import { useUI } from './ui';

type Hit = { type: string; title: string; sub: string; url: string; image?: string };

/** ⌘K search across products, the coming range, collections, journal and pages. */
export function SearchDialog() {
  const { searchOpen, setSearchOpen } = useUI();
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  const groups = useMemo(() => {
    const hits: Hit[] = q.trim() ? search(q).slice(0, 24) : [];
    const by = new Map<string, Hit[]>();
    hits.forEach((h) => by.set(h.type, [...(by.get(h.type) || []), h]));
    return [...by.entries()];
  }, [q]);

  const suggestions = useMemo(() => allItems().slice(0, 6), []);

  const go = (url: string) => {
    setSearchOpen(false);
    setQ('');
    navigate(url);
  };

  return (
    <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
      <DialogContent className="top-[12vh] translate-y-0 gap-0 overflow-hidden rounded-2xl border-line bg-porcelain p-0 sm:max-w-2xl" showCloseButton={false}>
        <DialogTitle className="sr-only">Search</DialogTitle>
        <DialogDescription className="sr-only">Search products, collections and the journal</DialogDescription>
        <Command shouldFilter={false} className="bg-transparent">
          <CommandInput value={q} onValueChange={setQ} placeholder="Search products and the journal" className="h-14 text-base" />
          <CommandList className="max-h-[60vh] p-2">
            {q.trim() ? (
              <>
                <CommandEmpty className="py-10 text-center text-sm text-cocoa-3">Nothing found for “{q}”. Try “mist” or “body care”.</CommandEmpty>
                {groups.map(([type, hits]) => (
                  <CommandGroup key={type} heading={type} className="[&_[cmdk-group-heading]]:eyebrow">
                    {hits.map((h) => (
                      <CommandItem key={h.url + h.title} value={h.url + h.title} onSelect={() => go(h.url)} className="gap-3 rounded-xl py-2.5 data-[selected=true]:bg-sand">
                        {h.image ? <img src={thumb(h.image)} alt="" width={40} height={50} className="h-[50px] w-10 rounded-md object-cover" /> : <span className="h-[50px] w-10 rounded-md bg-sand" />}
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate font-display text-lg leading-tight">{h.title}</span>
                          <span className="truncate text-xs text-cocoa-3">{h.sub}</span>
                        </span>
                        <ArrowRight className="ml-auto size-4 opacity-40" strokeWidth={1.3} />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))}
              </>
            ) : (
              <CommandGroup heading="The range" className="[&_[cmdk-group-heading]]:eyebrow">
                <div className="grid grid-cols-3 gap-2 p-1 sm:grid-cols-6">
                  {suggestions.map((x: any) => {
                    const key = x.kind === 'product' ? x.item.images[0]?.key : x.item.image;
                    return (
                      <CommandItem key={x.item.handle} value={x.item.handle} onSelect={() => go(itemUrl(x))} className="flex-col items-start gap-1.5 rounded-xl p-1.5 data-[selected=true]:bg-sand">
                        <img src={thumb(key)} alt="" width={96} height={120} className="aspect-[4/5] w-full rounded-lg object-cover" />
                        <span className="text-xs leading-tight">{x.item.name}</span>
                        <span className="text-[0.65rem] text-cocoa-3">{statusOf(x.item) || 'Available'}</span>
                      </CommandItem>
                    );
                  })}
                </div>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
        <div className="flex items-center justify-between border-t border-line px-4 py-2.5 text-[0.7rem] text-cocoa-3">
          <span>
            <kbd className="font-sans">↵</kbd> to open · <kbd className="font-sans">esc</kbd> to close
          </span>
          {q.trim() && (
            <button type="button" className="underline underline-offset-2 cursor-pointer" onClick={() => go(`/search?q=${encodeURIComponent(q)}`)}>
              See all results
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
