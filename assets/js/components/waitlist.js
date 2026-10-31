import { site } from '../../../site.config.js';
import { esc, uid } from '../lib/util.js';
import { emailField, wireForm } from '../lib/forms.js';

/**
 * Early-access / notify-me form. `interests` renders checkbox chips;
 * `preset` pre-selects one. Submissions go through lib/forms.js, which only
 * reports success when a configured endpoint confirms receipt.
 */
export const waitlistForm = ({ interests = [], preset = [], item = null, cta = 'Join the list', compact = false, dark = false } = {}) => {
  const id = uid('wl');
  return `<form class="waitlist${dark ? ' on-dark' : ''}" data-waitlist data-form-name="${item ? 'notify-me' : 'early-access'}">
    ${item ? `<input type="hidden" name="item" value="${esc(item)}">` : ''}
    ${
      interests.length
        ? `<fieldset class="chips" style="margin-bottom:6px"><legend class="visually-hidden">I’m interested in</legend>${interests
            .map((i) => `<label class="chip"><input type="checkbox" name="interests" value="${esc(i)}" ${preset.includes(i) ? 'checked' : ''}><span>${esc(i)}</span></label>`)
            .join('')}</fieldset>`
        : ''
    }
    <div class="${compact ? '' : 'inline-form-wrap'}">
      ${emailField(`${id}-email`, { hideLabel: true })}
    </div>
    <button class="btn${dark ? ' btn--light' : ''}" type="submit">${esc(cta)}</button>
    <p class="consent small${dark ? '' : ' muted'}" style="margin:0">${esc(site.forms.consentText)} <a href="privacy.html">Privacy policy</a>.</p>
    <p class="form-status" data-status role="status" aria-live="polite" hidden></p>
  </form>`;
};

export const wireWaitlists = (root = document) => {
  root.querySelectorAll('form[data-waitlist]').forEach((form) => {
    if (form.dataset.wired) return;
    form.dataset.wired = '1';
    wireForm(form, {
      name: form.dataset.formName,
      success: form.dataset.formName === 'notify-me' ? 'Thank you — we’ll email you when it’s ready.' : 'Thank you — you’re on the list.',
    });
  });
};
