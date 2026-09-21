import {
  cancelMyOrder,
  checkout,
  getMyOrder,
  listMyOrders,
} from '../controllers/order.controller.js';
import { createPaymentSession, verifyPayment } from '../controllers/payment.controller.js';
import { requireAuth } from '../middleware/auth.js';

export default async function orderRoutes(app) {
  app.addHook('preHandler', requireAuth);

  app.get('/', listMyOrders);
  app.get('/:id', getMyOrder);

  // Checkout writes stock reservations, so it is deliberately slow to abuse.
  app.post('/', { config: { rateLimit: { max: 12, timeWindow: '5 minutes' } } }, checkout);
  app.post('/:id/cancel', cancelMyOrder);

  app.post('/:id/payment-session', createPaymentSession);
  app.post('/payments/verify', verifyPayment);
}
