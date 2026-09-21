import {
  addToCart,
  getCart,
  previewCoupon,
  removeCartItem,
  updateCartItem,
} from '../controllers/cart.controller.js';
import { optionalAuth } from '../middleware/auth.js';

/** The cart works signed in or not, so every route resolves the user softly. */
export default async function cartRoutes(app) {
  app.addHook('preHandler', optionalAuth);

  app.get('/', getCart);
  app.get('/preview', previewCoupon);
  app.post('/items', addToCart);
  app.patch('/items/:itemId', updateCartItem);
  app.delete('/items/:itemId', removeCartItem);
}
