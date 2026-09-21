import { getPublicPage, getPublicPages } from '../controllers/content.controller.js';

export default async function pageRoutes(app) {
  app.get('/', getPublicPages);
  app.get('/:slug', getPublicPage);
}
