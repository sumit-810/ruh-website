import { useId, useState, type FormEvent } from 'react';
import { site } from '../../../site.config.js';
import { Button } from '@/components/ui/button';
import { failureMessage, formToObject, send, validateForm } from '@/lib/forms';
import { cn } from '@/lib/utils';
import { SmartLink } from './SmartLink';

/**
 * Early-access / notify-me form. `interests` renders checkbox chips; `item`
 * makes it a notify-me for one product. Posts to /api/subscribe; a thank-you
 * shows only when the server confirms the address was stored.
 */
export function WaitlistForm({
  interests = [],
  preset = [],
  item,
  cta = 'Join the list',
  compact = false,
  dark = false,
  hidden = {},
  className,
}: {
  interests?: string[];
  preset?: string[];
  item?: string;
  cta?: string;
  compact?: boolean;
  dark?: boolean;
  hidden?: Record<string, string>;
  className?: string;
}) {
  const id = useId();
  const [error, setError] = useState('');
  const [status, setStatus] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const name = item ? 'notify-me' : 'early-access';

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const errors = validateForm(form);
    setError(errors.email || '');
    if (errors.email) return;
    const data = formToObject(form);
    if (data['bot-field']) return;
    setBusy(true);
    const result = await send(name, data);
    setBusy(false);
    if (result.ok) {
      setStatus({ tone: 'success', text: item ? 'Thank you — we’ll email you as soon as it’s available.' : 'Thank you — you’re on the list.' });
      form.reset();
    } else setStatus({ tone: 'error', text: failureMessage(result.reason) });
  };

  return (
    <form className={cn('grid gap-4', dark && 'on-dark', className)} onSubmit={onSubmit} noValidate data-form={name}>
      {item && <input type="hidden" name="item" value={item} />}
      {Object.entries(hidden).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <p className="sr-only" aria-hidden="true">
        <label>
          Leave this empty <input name="bot-field" tabIndex={-1} autoComplete="off" />
        </label>
      </p>
      {interests.length > 0 && (
        <fieldset className="flex flex-wrap gap-2">
          <legend className="sr-only">I’m interested in</legend>
          {interests.map((i) => (
            <label key={i} className="chip">
              <input type="checkbox" name="interests" value={i} defaultChecked={preset.includes(i)} className="sr-only" />
              <span>{i}</span>
            </label>
          ))}
        </fieldset>
      )}
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex-1">
          <label htmlFor={`${id}-email`} className="sr-only">
            Email address
          </label>
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="Your email address"
            className="field-input"
            data-validate="required email"
            aria-invalid={error ? true : undefined}
            aria-describedby={`${id}-err`}
            onInput={() => error && setError('')}
          />
          <span id={`${id}-err`} className={cn('mt-1.5 block px-5 text-xs', dark ? 'text-[#f0b8a6]' : 'text-error')} aria-live="polite">
            {error}
          </span>
        </div>
        <Button type="submit" size="default" variant={dark ? 'light' : 'default'} disabled={busy} className="sm:self-start">
          {busy ? 'Sending…' : cta}
        </Button>
      </div>
      {!compact && (
        <p className={cn('text-xs', dark ? 'text-on-dark-2' : 'text-cocoa-3')}>
          {site.forms.consentText}{' '}
          <SmartLink href="/privacy" className="text-link">
            Privacy policy
          </SmartLink>
          .
        </p>
      )}
      {status && (
        <p role="status" className={cn('rounded-xl px-4 py-3 text-sm', status.tone === 'success' ? (dark ? 'bg-white/10' : 'bg-[#e6ede3] text-success') : dark ? 'bg-white/10 text-[#f0b8a6]' : 'bg-[#f6e3dc] text-error')}>
          {status.text}
        </p>
      )}
    </form>
  );
}
