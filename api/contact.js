// Vercel Function: POST /api/contact — logic lives in server/email.mjs (shared with the tests).
import { contact } from '../server/email.mjs';

export default {
  fetch: (request) => contact(request),
};
