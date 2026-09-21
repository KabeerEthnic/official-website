import env from '../config/env.js';
import { forbidden } from '../lib/errors.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * CSRF defence for a cookie-authenticated API.
 *
 * Browsers always attach an Origin header to cross-site state-changing
 * requests, so rejecting mutations whose Origin is not an allowed storefront
 * blocks forged submissions even when the cookie must be SameSite=None
 * (frontend and API on different domains). Non-browser callers send no Origin
 * and no cookie, so they are unaffected.
 */
export function registerCsrfGuard(app) {
  const allowed = new Set(env.corsOrigins);

  app.addHook('onRequest', async (request) => {
    if (SAFE_METHODS.has(request.method)) return;

    // Provider webhooks are server-to-server and authenticated by signature.
    if (request.url.startsWith('/api/webhooks/')) return;

    const origin = request.headers.origin;
    if (!origin) {
      // No Origin means no browser-initiated cross-site request; a session
      // cookie cannot have been attached by a third-party page.
      if (request.cookies?.kes_session) {
        throw forbidden('Missing Origin header on an authenticated request');
      }
      return;
    }

    if (!allowed.has(origin)) throw forbidden('Request origin is not allowed');
  });
}
