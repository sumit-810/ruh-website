// Vercel Function: POST /api/verify-payment — logic lives in server/verify-payment.mjs (shared with the tests).
import { verifyPayment } from '../server/verify-payment.mjs';

export default {
  fetch: (request) => verifyPayment(request),
};
