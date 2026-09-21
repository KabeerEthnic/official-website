import api from './client.js';

/**
 * Typed-by-convention wrappers around the REST API, grouped by resource. Every
 * component reaches the backend through one of these — no raw fetch calls live
 * in the UI.
 */

export const auth = {
  me: (options) => api.get('/auth/me', options).then((r) => r.data.user),
  login: (credentials) => api.post('/auth/login', credentials).then((r) => r.data.user),
  /** Returns { email, verificationRequired } — no session until the code is entered. */
  register: (details) => api.post('/auth/register', details).then((r) => r.data),
  logout: () => api.post('/auth/logout'),
  updateProfile: (input) => api.patch('/auth/me', input).then((r) => r.data.user),
  changePassword: (input) => api.post('/auth/me/password', input),

  verifyEmail: (input) => api.post('/auth/verify-email', input).then((r) => r.data.user),
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (input) => api.post('/auth/reset-password', input).then((r) => r.data.user),
};

export const support = {
  tickets: (params, options) => api.get('/support/tickets', { ...options, params }),
  ticket: (id, options) => api.get(`/support/tickets/${id}`, options).then((r) => r.data),
  create: (input) => api.post('/support/tickets', input).then((r) => r.data),
  reply: (id, body) => api.post(`/support/tickets/${id}/replies`, { body }).then((r) => r.data),
};

export const catalog = {
  products: (params, options) => api.get('/products', { ...options, params }),
  product: (slug, options) => api.get(`/products/${slug}`, options).then((r) => r.data),
  reviews: (slug, params, options) => api.get(`/products/${slug}/reviews`, { ...options, params }),
  categories: (options) => api.get('/categories', options).then((r) => r.data),
  filters: (params, options) => api.get('/products/filters', { ...options, params }).then((r) => r.data),
};

export const cart = {
  get: (options) => api.get('/cart', options).then((r) => r.data),
  preview: (code, options) => api.get('/cart/preview', { ...options, params: { code } }).then((r) => r.data),
  addItem: (productId, quantity = 1) =>
    api.post('/cart/items', { productId, quantity }).then((r) => r.data),
  updateItem: (itemId, quantity) =>
    api.patch(`/cart/items/${itemId}`, { quantity }).then((r) => r.data),
  removeItem: (itemId) => api.delete(`/cart/items/${itemId}`).then((r) => r.data),
};

export const orders = {
  list: (params, options) => api.get('/orders', { ...options, params }),
  get: (id, options) => api.get(`/orders/${id}`, options).then((r) => r.data),
  checkout: (input) => api.post('/orders', input).then((r) => r.data),
  cancel: (id, reason) => api.post(`/orders/${id}/cancel`, { reason }).then((r) => r.data),
  paymentSession: (id) => api.post(`/orders/${id}/payment-session`).then((r) => r.data),
  verifyPayment: (input) => api.post('/orders/payments/verify', input).then((r) => r.data),
};

export const payments = {
  config: (options) => api.get('/payments/config', options).then((r) => r.data),
};

export const users = {
  addresses: (options) => api.get('/users/addresses', options).then((r) => r.data),
  createAddress: (input) => api.post('/users/addresses', input).then((r) => r.data),
  updateAddress: (id, input) => api.patch(`/users/addresses/${id}`, input).then((r) => r.data),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
  wishlist: (options) => api.get('/users/wishlist', options).then((r) => r.data),
  addToWishlist: (productId) => api.post('/users/wishlist', { productId }).then((r) => r.data),
  removeFromWishlist: (productId) => api.delete(`/users/wishlist/${productId}`).then((r) => r.data),
};

export const reviews = {
  create: (input) => api.post('/reviews', input).then((r) => r.data),
  update: (id, input) => api.patch(`/reviews/${id}`, input).then((r) => r.data),
  remove: (id) => api.delete(`/reviews/${id}`),
};

export const content = {
  page: (slug, options) => api.get(`/pages/${slug}`, options).then((r) => r.data),
};

export const newsletter = {
  subscribe: (email) => api.post('/newsletter', { email }),
};

export const admin = {
  dashboard: (options) => api.get('/admin/dashboard', options).then((r) => r.data),

  products: (params, options) => api.get('/admin/products', { ...options, params }),
  product: (id, options) => api.get(`/admin/products/${id}`, options).then((r) => r.data),
  createProduct: (input) => api.post('/admin/products', input).then((r) => r.data),
  updateProduct: (id, input) => api.patch(`/admin/products/${id}`, input).then((r) => r.data),
  archiveProduct: (id) => api.post(`/admin/products/${id}/archive`).then((r) => r.data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  addProductImages: (id, images) =>
    api.post(`/admin/products/${id}/images`, { images }).then((r) => r.data),
  removeProductImage: (id, imageId) =>
    api.delete(`/admin/products/${id}/images/${imageId}`).then((r) => r.data),
  reorderProductImages: (id, ids) =>
    api.put(`/admin/products/${id}/images/order`, { ids }).then((r) => r.data),
  setStock: (id, input) => api.put(`/admin/products/${id}/stock`, input).then((r) => r.data),

  categories: (options) => api.get('/admin/categories', options).then((r) => r.data),
  createCategory: (input) => api.post('/admin/categories', input).then((r) => r.data),
  updateCategory: (id, input) => api.patch(`/admin/categories/${id}`, input).then((r) => r.data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),

  orders: (params, options) => api.get('/admin/orders', { ...options, params }),
  order: (id, options) => api.get(`/admin/orders/${id}`, options).then((r) => r.data),
  updateOrder: (id, input) => api.patch(`/admin/orders/${id}`, input).then((r) => r.data),
  cancelOrder: (id, reason) => api.post(`/admin/orders/${id}/cancel`, { reason }).then((r) => r.data),

  customers: (params, options) => api.get('/admin/customers', { ...options, params }),
  customer: (id, options) => api.get(`/admin/customers/${id}`, options).then((r) => r.data),
  updateCustomer: (id, input) => api.patch(`/admin/customers/${id}`, input).then((r) => r.data),

  reviews: (params, options) => api.get('/admin/reviews', { ...options, params }),
  moderateReview: (id, status) => api.patch(`/admin/reviews/${id}`, { status }).then((r) => r.data),
  deleteReview: (id) => api.delete(`/admin/reviews/${id}`),

  coupons: (params, options) => api.get('/admin/coupons', { ...options, params }),
  createCoupon: (input) => api.post('/admin/coupons', input).then((r) => r.data),
  updateCoupon: (id, input) => api.patch(`/admin/coupons/${id}`, input).then((r) => r.data),
  deleteCoupon: (id) => api.delete(`/admin/coupons/${id}`),

  sectionTypes: (options) => api.get('/admin/content/section-types', options).then((r) => r.data),
  pages: (options) => api.get('/admin/content/pages', options).then((r) => r.data),
  page: (slug, options) => api.get(`/admin/content/pages/${slug}`, options).then((r) => r.data),
  updatePage: (slug, input) => api.patch(`/admin/content/pages/${slug}`, input).then((r) => r.data),
  updateSection: (slug, key, input) =>
    api.patch(`/admin/content/pages/${slug}/sections/${key}`, input).then((r) => r.data),
  reorderSections: (slug, keys) =>
    api.put(`/admin/content/pages/${slug}/sections/order`, { keys }).then((r) => r.data),

  // Governance: issue desk, audit trail, administrators.
  governanceSummary: (options) => api.get('/admin/governance/summary', options).then((r) => r.data),

  tickets: (params, options) => api.get('/admin/governance/tickets', { ...options, params }),
  ticket: (id, options) => api.get(`/admin/governance/tickets/${id}`, options).then((r) => r.data),
  replyToTicket: (id, body) =>
    api.post(`/admin/governance/tickets/${id}/replies`, { body }).then((r) => r.data),
  setTicketStatus: (id, status) =>
    api.patch(`/admin/governance/tickets/${id}/status`, { status }).then((r) => r.data),

  auditLog: (params, options) => api.get('/admin/governance/audit', { ...options, params }),
  auditActions: (options) => api.get('/admin/governance/audit/actions', options).then((r) => r.data),

  admins: (options) => api.get('/admin/governance/admins', options).then((r) => r.data),
  inviteAdmin: (input) => api.post('/admin/governance/admins', input),
  signOutAdmin: (id) => api.post(`/admin/governance/admins/${id}/sign-out`).then((r) => r.data),
  revokeAdmin: (id) => api.post(`/admin/governance/admins/${id}/revoke`).then((r) => r.data),
  deleteAdmin: (id) => api.delete(`/admin/governance/admins/${id}`),

  uploadMedia: (file, folder = 'products') => {
    const form = new FormData();
    form.append('folder', folder);
    form.append('file', file);
    return api.upload('/admin/media', form).then((r) => r.data);
  },
};

export { ApiError, onUnauthorized } from './client.js';
