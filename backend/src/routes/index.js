import { getPaymentConfig } from '../controllers/payment.controller.js';
import adminRoutes from './admin/index.js';
import authRoutes from './auth.routes.js';
import cartRoutes from './cart.routes.js';
import catalogRoutes from './catalog.routes.js';
import newsletterRoutes from './newsletter.routes.js';
import orderRoutes from './orders.routes.js';
import pageRoutes from './pages.routes.js';
import reviewRoutes from './reviews.routes.js';
import supportRoutes from './support.routes.js';
import userRoutes from './users.routes.js';
import webhookRoutes from './webhooks.routes.js';

export default async function registerRoutes(app) {
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(catalogRoutes, { prefix: '/api' });
  await app.register(cartRoutes, { prefix: '/api/cart' });
  await app.register(orderRoutes, { prefix: '/api/orders' });
  await app.register(userRoutes, { prefix: '/api/users' });
  await app.register(reviewRoutes, { prefix: '/api/reviews' });
  await app.register(supportRoutes, { prefix: '/api/support' });
  await app.register(pageRoutes, { prefix: '/api/pages' });
  await app.register(newsletterRoutes, { prefix: '/api/newsletter' });
  await app.register(adminRoutes, { prefix: '/api/admin' });
  await app.register(webhookRoutes, { prefix: '/api/webhooks' });

  app.get('/api/payments/config', getPaymentConfig);
}
