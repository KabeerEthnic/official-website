/**
 * Minimal environment for the unit tests. They exercise pure logic — pricing,
 * hashing, coupon maths, signatures — so no database connection is opened;
 * these values only satisfy the config validator at import time.
 */
process.env.NODE_ENV = 'test';
process.env.CORS_ORIGINS ??= 'http://localhost:5173';
process.env.DATABASE_URL ??= 'postgresql://test:test@localhost:5432/test';
process.env.DIRECT_URL ??= 'postgresql://test:test@localhost:5432/test';
process.env.AUTH_SECRET ??= 'test-auth-secret-value-at-least-32-characters-long';
process.env.RAZORPAY_KEY_ID ??= 'rzp_test_key';
process.env.RAZORPAY_KEY_SECRET ??= 'rzp_test_secret';
process.env.RAZORPAY_WEBHOOK_SECRET ??= 'rzp_test_webhook_secret';
