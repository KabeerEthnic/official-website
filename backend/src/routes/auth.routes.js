import {
  login,
  logout,
  me,
  register,
  updatePassword,
  updateProfile,
} from '../controllers/auth.controller.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';

/** Credential endpoints get their own, much tighter rate limit. */
const credentialLimit = {
  config: { rateLimit: { max: 10, timeWindow: '5 minutes' } },
};

export default async function authRoutes(app) {
  app.post('/register', credentialLimit, register);
  app.post('/login', credentialLimit, login);
  app.post('/logout', { preHandler: optionalAuth }, logout);

  app.get('/me', { preHandler: requireAuth }, me);
  app.patch('/me', { preHandler: requireAuth }, updateProfile);
  app.post('/me/password', { ...credentialLimit, preHandler: requireAuth }, updatePassword);
}
