import { CART_COOKIE, cartCookieOptions, createToken } from '../lib/session.js';
import { resolveCart } from '../services/cart.service.js';

/**
 * Gives the request its cart. Signed-in visitors use the cart attached to
 * their account; guests get one keyed by a long-lived cart cookie, issued
 * lazily so a plain catalogue visit never sets a cookie.
 */
export async function requestCart(request, reply, { create = true } = {}) {
  const userId = request.user?.id ?? null;
  let cartToken = request.cookies?.[CART_COOKIE] ?? null;

  if (!userId && !cartToken) {
    if (!create) return null;
    cartToken = createToken();
    reply.setCookie(CART_COOKIE, cartToken, cartCookieOptions());
  }

  const cart = await resolveCart({ userId, cartToken }, { create });

  if (!userId && cart && cartToken) {
    // Refresh the cookie window on every cart touch.
    reply.setCookie(CART_COOKIE, cartToken, cartCookieOptions());
  }

  return cart;
}
