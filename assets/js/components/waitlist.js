import { site } from '../../../site.config.js';
import { esc, uid } from '../lib/util.js';
import { emailField, wireForm } from '../lib/forms.js';

/**
 * Early-access / notify-me form. `interests` renders checkbox chips;
 * `item` makes it a notify-me for one product. Submissions go to the site's
 * /api/subscribe; success is shown only when the server confirms it.
 */
export const waitlistForm = ({ interests = [], preset = [], item = null, cta = 'Join the list', compact = false, dark = false, id: fixedId, hidden = {} } = {}) => {
  const id = fixedId || uid('wl');
  return `<form class="waitlist${dark ? ' on-dark' : ''}" data-waitlist data-form-name="${item ? 'notify-me' : 'early-access'}">
    ${item ? `<input type="hidden" name="item" value="${esc(item)}">` : ''}
    ${Object.entries(hidden).map(([k, v]) => `<input type="hidden" name="${esc(k)}" value="${esc(v)}">`).join('')}
    <p class="visually-hidden" aria-hidden="true"><label>Leave this empty <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>
    ${
      interests.length
        ? `<fieldset class="chips"><legend class="visually-hidden">I’m interested in</legend>${interests
            .map((i) => `<label class="chip"><input type="checkbox" name="interests" value="${esc(i)}" ${preset.includes(i) ? 'checked' : ''}><span>${esc(i)}</span></label>`)
            .join('')}</fieldset>`
        : ''
    }
    <div class="waitlist__row">
      ${emailField(`${id}-email`, { hideLabel: true })}
      <button class="btn${dark ? ' btn--light' : ''}" type="submit">${esc(cta)}</button>
    </div>
    ${compact ? '' : `<p class="consent${dark ? '' : ' muted'}" style="margin:0">${esc(site.forms.consentText)} <a href="privacy.html">Privacy policy</a>.</p>`}
    <p class="form-status" data-status role="status" aria-live="polite" hidden></p>
  </form>`;
};

export const wireWaitlists = (root = document) => {
  root.querySelectorAll('form[data-waitlist]').forEach((form) => {
    if (form.dataset.wired) return;
    form.dataset.wired = '1';
    wireForm(form, {
      name: form.dataset.formName,
      success: form.dataset.formName === 'notify-me' ? 'Thank you — we’ll email you as soon as it’s available.' : 'Thank you — you’re on the list.',
    });
  });
};
