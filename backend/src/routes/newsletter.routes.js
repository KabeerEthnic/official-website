import { subscribe } from '../controllers/newsletter.controller.js';

export default async function newsletterRoutes(app) {
  app.post('/', { config: { rateLimit: { max: 5, timeWindow: '10 minutes' } } }, subscribe);
}
