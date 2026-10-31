// Vercel Function: POST /api/create-order — logic lives in server/create-order.mjs (shared with the tests).
import { createOrder } from '../server/create-order.mjs';

export default {
  fetch: (request) => createOrder(request),
};
