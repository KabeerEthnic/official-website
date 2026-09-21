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
import {
  deleteAdmin,
  getAuditActions,
  getAuditLog,
  getGovernanceSummary,
  getTicketDetail,
  inviteAdmin,
  listAdmins,
  listTickets,
  patchTicketStatus,
  postReply,
  revokeAdmin,
  signOutAdmin,
} from '../../controllers/admin/governance.controller.js';
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

  /* ------------------------------------------------------------ governance */

  app.get('/governance/summary', getGovernanceSummary);

  // Issue desk — the admin side of the storefront's "raise an issue" page.
  app.get('/governance/tickets', listTickets);
  app.get('/governance/tickets/:id', getTicketDetail);
  app.post('/governance/tickets/:id/replies', postReply);
  app.patch('/governance/tickets/:id/status', patchTicketStatus);

  // Audit log — append only, so there is no write route here by design.
  app.get('/governance/audit', getAuditLog);
  app.get('/governance/audit/actions', getAuditActions);

  // Administrators.
  app.get('/governance/admins', listAdmins);
  app.post('/governance/admins', inviteAdmin);
  app.post('/governance/admins/:id/sign-out', signOutAdmin);
  app.post('/governance/admins/:id/revoke', revokeAdmin);
  app.delete('/governance/admins/:id', deleteAdmin);
}
