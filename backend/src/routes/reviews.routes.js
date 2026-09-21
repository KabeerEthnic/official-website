import { postReview, putReview, removeReview } from '../controllers/review.controller.js';
import { requireAuth } from '../middleware/auth.js';

/**
 * Reading reviews lives with the product it belongs to
 * (GET /api/products/:slug/reviews); this module owns the writes.
 */
export default async function reviewRoutes(app) {
  app.addHook('preHandler', requireAuth);

  app.post('/', { config: { rateLimit: { max: 10, timeWindow: '10 minutes' } } }, postReview);
  app.patch('/:id', putReview);
  app.delete('/:id', removeReview);
}
