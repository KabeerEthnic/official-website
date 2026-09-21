import {
  getCategories,
  getFilters,
  getProduct,
  getProductReviews,
  getProducts,
} from '../controllers/catalog.controller.js';

export default async function catalogRoutes(app) {
  app.get('/products', getProducts);
  app.get('/products/filters', getFilters);
  app.get('/products/:slug', getProduct);
  app.get('/products/:slug/reviews', getProductReviews);

  app.get('/categories', getCategories);
}
