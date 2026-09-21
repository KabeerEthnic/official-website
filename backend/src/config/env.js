import { z } from 'zod';

/**
 * Load backend/.env before anything reads the config.
 *
 * The Prisma CLI loads .env on its own, but `node src/server.js` and
 * `node prisma/seed.js` do not — so this is done here, the one place every
 * entry point goes through, rather than in each npm script.
 *
 * Real environment variables always win: loadEnvFile never overwrites a key
 * that is already set, so a hosting platform's config takes precedence over a
 * stray .env file. The path is resolved from this module, not the working
 * directory, so it works whichever directory the process was started from.
 * Tests are kept hermetic by skipping the file entirely.
 */
if (process.env.NODE_ENV !== 'test') {
  try {
    process.loadEnvFile(new URL('../../.env', import.meta.url));
  } catch (error) {
    // No .env is normal in production, where the platform supplies the config.
    if (error.code !== 'ENOENT') throw error;
  }
}

/**
 * Environment contract. The process refuses to boot on an invalid config so a
 * misconfigured deployment fails immediately instead of at the first request.
 */
const booleanish = z
  .enum(['true', 'false', '1', '0'])
  .transform((v) => v === 'true' || v === '1');

const schema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(4000),
    HOST: z.string().default('0.0.0.0'),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),

    DATABASE_URL: z.string().url(),
    DIRECT_URL: z.string().url().optional(),

    /** Comma-separated list of browser origins allowed to call this API. */
    CORS_ORIGINS: z.string().default('http://localhost:5173'),
    /** Public URL of the storefront, used in links sent to customers. */
    FRONTEND_URL: z.string().url().default('http://localhost:5173'),

    /** Signing key for the session cookie. Rotating it logs everyone out. */
    AUTH_SECRET: z.string().min(32, 'AUTH_SECRET must be at least 32 characters'),
    SESSION_TTL_DAYS: z.coerce.number().int().positive().max(90).default(30),
    COOKIE_DOMAIN: z.string().optional(),
    /** Use "none" only when the storefront is on a different site than the API. */
    COOKIE_SAMESITE: z.enum(['lax', 'strict', 'none']).default('lax'),
    COOKIE_SECURE: booleanish.optional(),

    /** Order pricing rules, in paise / percent. */
    TAX_PERCENT: z.coerce.number().min(0).max(100).default(5),
    SHIPPING_FLAT: z.coerce.number().int().min(0).default(0),
    FREE_SHIPPING_THRESHOLD: z.coerce.number().int().min(0).default(0),
    /** Unpaid orders older than this release their stock reservation. */
    ORDER_RESERVATION_MINUTES: z.coerce.number().int().positive().default(30),

    RAZORPAY_KEY_ID: z.string().optional(),
    RAZORPAY_KEY_SECRET: z.string().optional(),
    RAZORPAY_WEBHOOK_SECRET: z.string().optional(),

    SUPABASE_URL: z.string().url().optional(),
    /** Current-generation server key (`sb_secret_…`). Server-only. */
    SUPABASE_SECRET_KEY: z.string().optional(),
    /**
     * Legacy `service_role` JWT. Supabase is retiring these through 2026; it is
     * still accepted so an existing deployment can migrate without downtime.
     */
    SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
    SUPABASE_STORAGE_BUCKET: z.string().default('product-media'),

    MAX_UPLOAD_BYTES: z.coerce.number().int().positive().default(5 * 1024 * 1024),
    MAX_BODY_BYTES: z.coerce.number().int().positive().default(1024 * 1024),

    /** Only read by `npm run db:seed`, to create the first administrator. */
    SEED_ADMIN_EMAIL: z.string().trim().toLowerCase().email().optional(),
    SEED_ADMIN_PASSWORD: z.string().min(10).optional(),
    SEED_ADMIN_NAME: z.string().trim().min(2).max(80).default('Store Owner'),
  })
  .superRefine((value, ctx) => {
    if (value.COOKIE_SAMESITE === 'none' && value.COOKIE_SECURE === false) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['COOKIE_SECURE'],
        message: 'COOKIE_SAMESITE=none requires COOKIE_SECURE=true',
      });
    }

    // Pasting the publishable key into the server slot is an easy mistake that
    // would otherwise only surface as a confusing 401 on the first upload.
    for (const key of ['SUPABASE_SECRET_KEY', 'SUPABASE_SERVICE_ROLE_KEY']) {
      if (value[key]?.startsWith('sb_publishable_')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key],
          message: 'This is the publishable key. Use the secret key (sb_secret_…) here.',
        });
      }
    }
  });

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`);
  console.error(`Invalid environment configuration:\n${issues.join('\n')}`);
  process.exit(1);
}

const raw = parsed.data;
const isProduction = raw.NODE_ENV === 'production';

/**
 * Prefer the current-generation secret key; fall back to the legacy
 * service_role JWT so a deployment mid-migration keeps working.
 */
const supabaseKey = raw.SUPABASE_SECRET_KEY || raw.SUPABASE_SERVICE_ROLE_KEY || null;

if (!raw.SUPABASE_SECRET_KEY && raw.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    'SUPABASE_SERVICE_ROLE_KEY is a legacy key that Supabase is retiring. ' +
      'Create a secret key in the dashboard and set SUPABASE_SECRET_KEY instead.',
  );
}

export const env = {
  ...raw,
  isProduction,
  isTest: raw.NODE_ENV === 'test',
  corsOrigins: raw.CORS_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  cookieSecure: raw.COOKIE_SECURE ?? isProduction,
  /** Razorpay is optional at boot; checkout reports it clearly when missing. */
  razorpayEnabled: Boolean(raw.RAZORPAY_KEY_ID && raw.RAZORPAY_KEY_SECRET),
  supabaseKey,
  storageEnabled: Boolean(raw.SUPABASE_URL && supabaseKey),
};

export default env;
