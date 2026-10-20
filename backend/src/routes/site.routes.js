import { getSiteStatus } from '../controllers/site.controller.js';

export default async function siteRoutes(app) {
  app.get('/', getSiteStatus);
}
