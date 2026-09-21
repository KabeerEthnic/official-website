import {
  deleteAdminCategory,
  deleteAdminProduct,
  deleteProductImage,
  getAdminProduct,
  listAdminCategories,
  listAdminProducts,
  patchCategory,
  patchProduct,
  postArchiveProduct,
  postCategory,
  postProduct,
  postProductImages,
  putProductImageOrder,
  putStock,
} from '../../controllers/admin/catalog.controller.js';
import {
  getAdminPage,
  getSectionTypes,
  listAdminPages,
  patchAdminPage,
  patchAdminSection,
  putSectionOrder,
} from '../../controllers/admin/content.controller.js';
import {
  deleteCoupon,
  listCoupons,
  patchCoupon,
  postCoupon,
} from '../../controllers/admin/coupons.controller.js';
import { getCustomer, listCustomers, patchCustomer } from '../../controllers/admin/customers.controller.js';
import { getDashboard } from '../../controllers/admin/dashboard.controller.js';
import { deleteUpload, postUpload } from '../../controllers/admin/media.controller.js';
import {
  getAdminOrder,
  listAdminOrders,
  patchAdminOrder,
  postCancelAdminOrder,
} from '../../controllers/admin/orders.controller.js';
import {
  deleteAdminReview,
  listAdminReviews,
  patchReviewStatus,
} from '../../controllers/admin/reviews.controller.js';
import { requireAdmin } from '../../middleware/auth.js';

/**
 * Every route below is behind requireAdmin. Route protection in the React app
 * is only cosmetic — this hook is what actually stops a non-admin from calling
 * these endpoints directly.
 */
export default async function adminRoutes(app) {
  app.addHook('preHandler', requireAdmin);

  app.get('/dashboard', getDashboard);

  app.get('/products', listAdminProducts);
  app.post('/products', postProduct);
  app.get('/products/:id', getAdminProduct);
  app.patch('/products/:id', patchProduct);
  app.delete('/products/:id', deleteAdminProduct);
  app.post('/products/:id/archive', postArchiveProduct);
  app.post('/products/:id/images', postProductImages);
  app.put('/products/:id/images/order', putProductImageOrder);
  app.delete('/products/:id/images/:imageId', deleteProductImage);
  app.put('/products/:id/stock', putStock);

  app.get('/categories', listAdminCategories);
  app.post('/categories', postCategory);
  app.patch('/categories/:id', patchCategory);
  app.delete('/categories/:id', deleteAdminCategory);

  app.get('/orders', listAdminOrders);
  app.get('/orders/:id', getAdminOrder);
  app.patch('/orders/:id', patchAdminOrder);
  app.post('/orders/:id/cancel', postCancelAdminOrder);

  app.get('/customers', listCustomers);
  app.get('/customers/:id', getCustomer);
  app.patch('/customers/:id', patchCustomer);

  app.get('/reviews', listAdminReviews);
  app.patch('/reviews/:id', patchReviewStatus);
  app.delete('/reviews/:id', deleteAdminReview);

  app.get('/coupons', listCoupons);
  app.post('/coupons', postCoupon);
  app.patch('/coupons/:id', patchCoupon);
  app.delete('/coupons/:id', deleteCoupon);

  app.get('/content/section-types', getSectionTypes);
  app.get('/content/pages', listAdminPages);
  app.get('/content/pages/:slug', getAdminPage);
  app.patch('/content/pages/:slug', patchAdminPage);
  app.patch('/content/pages/:slug/sections/:key', patchAdminSection);
  app.put('/content/pages/:slug/sections/order', putSectionOrder);

  app.post('/media', postUpload);
  app.delete('/media', deleteUpload);
}
