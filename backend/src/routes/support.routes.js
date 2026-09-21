import {
  getMyTicket,
  listMyTickets,
  postMyReply,
  postTicket,
} from '../controllers/support.controller.js';
import { requireAuth } from '../middleware/auth.js';

export default async function supportRoutes(app) {
  app.addHook('preHandler', requireAuth);

  app.get('/tickets', listMyTickets);
  app.get('/tickets/:id', getMyTicket);
  // Raising an issue sends mail, so it is rate limited more tightly.
  app.post('/tickets', { config: { rateLimit: { max: 8, timeWindow: '15 minutes' } } }, postTicket);
  app.post('/tickets/:id/replies', postMyReply);
}
