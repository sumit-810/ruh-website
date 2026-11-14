import type { ReactNode } from 'react';
import AnimatedContent from '@/components/reactbits/AnimatedContent';

/** Soft fade-and-rise on scroll (React Bits AnimatedContent with the brand's easing). */
export function Reveal({ children, className, delay = 0, distance = 36, blur = 6, stagger }: { children: ReactNode; className?: string; delay?: number; distance?: number; blur?: number; stagger?: number }) {
  return (
    <AnimatedContent className={className} distance={distance} duration={1.1} ease="expo.out" initialOpacity={0} blur={blur} delay={delay} threshold={0.12} stagger={stagger}>
      {children}
    </AnimatedContent>
  );
}
