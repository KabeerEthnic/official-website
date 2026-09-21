import { razorpayWebhook } from '../controllers/payment.controller.js';

/**
 * Provider callbacks. Signature verification runs over the exact bytes that
 * were received, so this scope keeps the raw body instead of only the parsed
 * JSON. Registered under /api/webhooks, which the CSRF guard skips because
 * these requests carry no cookies and authenticate themselves.
 */
export default async function webhookRoutes(app) {
  app.addContentTypeParser('application/json', { parseAs: 'buffer' }, (request, body, done) => {
    request.rawBody = body;
    try {
      done(null, JSON.parse(body.toString('utf8')));
    } catch {
      done(null, {});
    }
  });

  app.post('/razorpay', { config: { rateLimit: { max: 120, timeWindow: '1 minute' } } }, razorpayWebhook);
}
