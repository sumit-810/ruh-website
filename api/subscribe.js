// Vercel Function: POST /api/subscribe — logic lives in server/email.mjs (shared with the tests).
import { subscribe } from '../server/email.mjs';

export default {
  fetch: (request) => subscribe(request),
};
