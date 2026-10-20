import {
  cancelMyOrder,
  checkout,
  getMyOrder,
  listMyOrders,
} from '../controllers/order.controller.js';
import { createPaymentSession, verifyPayment } from '../controllers/payment.controller.js';
import { serviceUnavailable } from '../lib/errors.js';
import { requireAuth } from '../middleware/auth.js';
import { isCurtainDown } from '../services/site.service.js';

/**
 * The curtain hides the storefront in the browser; this is what actually stops
 * new orders while it is down. Orders already placed can still be paid for or
 * cancelled. Administrators are let through so they can test checkout.
 */
async function refuseWhileCurtainDown(request) {
  if (request.user.role === 'ADMIN') return;
  if (await isCurtainDown()) {
    throw serviceUnavailable('The store is closed for the moment. Please try again once it reopens.');
  }
}

export default async function orderRoutes(app) {
  app.addHook('preHandler', requireAuth);

  app.get('/', listMyOrders);
  app.get('/:id', getMyOrder);

  // Checkout writes stock reservations, so it is deliberately slow to abuse.
  app.post(
    '/',
    { config: { rateLimit: { max: 12, timeWindow: '5 minutes' } }, preHandler: refuseWhileCurtainDown },
    checkout,
  );
  app.post('/:id/cancel', cancelMyOrder);

  app.post('/:id/payment-session', createPaymentSession);
  app.post('/payments/verify', verifyPayment);
}
