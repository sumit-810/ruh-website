import { Fragment, type ReactNode } from 'react';
import { site } from '../../site.config.js';

const moneyFmt = new Intl.NumberFormat(site.locale.lang, {
  style: 'currency',
  currency: site.locale.currency,
  maximumFractionDigits: 0,
});

export const money = (n: number | null | undefined) => moneyFmt.format(Number(n) || 0);

/** Turn "Gentle, from the *first mist.*" into text with <em> for the starred phrase. */
export const rich = (text: string | null | undefined): ReactNode => {
  if (!text) return null;
  return text.split(/(\*[^*]+\*)/g).map((part, i) =>
    part.startsWith('*') && part.endsWith('*') ? <em key={i}>{part.slice(1, -1)}</em> : <Fragment key={i}>{part}</Fragment>,
  );
};

/** Split "Gentle, from the *first mist.*" into [{ text, em }] segments (for animated headings). */
export const segments = (text: string) =>
  text
    .split(/(\*[^*]+\*)/g)
    .filter(Boolean)
    .map((part) => (part.startsWith('*') ? { text: part.slice(1, -1), em: true } : { text: part, em: false }));
