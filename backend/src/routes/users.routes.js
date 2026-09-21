import {
  addToWishlist,
  createAddress,
  deleteAddress,
  listAddresses,
  listWishlist,
  removeFromWishlist,
  updateAddress,
} from '../controllers/user.controller.js';
import { requireAuth } from '../middleware/auth.js';

export default async function userRoutes(app) {
  app.addHook('preHandler', requireAuth);

  app.get('/addresses', listAddresses);
  app.post('/addresses', createAddress);
  app.patch('/addresses/:id', updateAddress);
  app.delete('/addresses/:id', deleteAddress);

  app.get('/wishlist', listWishlist);
  app.post('/wishlist', addToWishlist);
  app.delete('/wishlist/:productId', removeFromWishlist);
}
