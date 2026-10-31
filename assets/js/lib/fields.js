/**
 * Labelled form field with an error slot. `control` receives the attributes
 * that wire it to its label, validation rules and error message:
 *
 *   field('c-email', 'Email', (a) => `<input ${a} class="input" type="email" name="email">`, 'required email')
 */
export const field = (id, label, control, rules = 'required', { className = '' } = {}) => `
<div class="field${className ? ` ${className}` : ''}">
  <label for="${id}">${label}</label>
  ${control(`id="${id}" aria-describedby="${id}-err"${rules ? ` data-validate="${rules}"` : ''}`)}
  <span class="field-error" id="${id}-err" aria-live="polite"></span>
</div>`;
