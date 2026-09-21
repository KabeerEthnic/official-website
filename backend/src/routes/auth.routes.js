import {
  completePasswordReset,
  forgotPassword,
  login,
  logout,
  me,
  register,
  resendVerification,
  updatePassword,
  updateProfile,
  verifyEmail,
} from '../controllers/auth.controller.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';

/** Credential endpoints get their own, much tighter rate limit. */
const credentialLimit = {
  config: { rateLimit: { max: 10, timeWindow: '5 minutes' } },
};

/**
 * Anything that sends an email is limited harder still — otherwise the
 * endpoint is a way to flood someone else's inbox. The OTP service adds a
 * per-address cooldown on top of this per-caller limit.
 */
const mailLimit = {
  config: { rateLimit: { max: 5, timeWindow: '15 minutes' } },
};

export default async function authRoutes(app) {
  app.post('/register', credentialLimit, register);
  app.post('/login', credentialLimit, login);
  app.post('/logout', { preHandler: optionalAuth }, logout);

  // Email verification — the gate on first sign-in.
  app.post('/verify-email', credentialLimit, verifyEmail);
  app.post('/resend-verification', mailLimit, resendVerification);

  // Password reset by emailed code.
  app.post('/forgot-password', mailLimit, forgotPassword);
  app.post('/reset-password', credentialLimit, completePasswordReset);

  app.get('/me', { preHandler: requireAuth }, me);
  app.patch('/me', { preHandler: requireAuth }, updateProfile);
  app.post('/me/password', { ...credentialLimit, preHandler: requireAuth }, updatePassword);
}
