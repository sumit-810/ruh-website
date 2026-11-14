import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { SmartLink } from './SmartLink';

export function ArrowLink({ href, children, className, onClick }: { href: string; children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <SmartLink href={href} className={cn('link-arrow', className)} onClick={onClick}>
      {children}
      <ArrowRight className="size-3.5" strokeWidth={1.4} aria-hidden />
    </SmartLink>
  );
}
