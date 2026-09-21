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
    /**
     * Public URL of the storefront, used in links sent to customers. Exactly
     * one URL: a comma-separated list parses as a valid URL whose host ends up
     * as "shop.example.com,https", which matches no browser origin and would
     * 403 every write while booting perfectly happily.
     */
    FRONTEND_URL: z
      .string()
      .url()
      .refine((value) => !value.includes(','), {
        message: 'FRONTEND_URL takes one URL — list any others in CORS_ORIGINS',
      })
      .default('http://localhost:5173'),

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

    /** Resend. Without a key, OTP flows refuse and receipts are skipped. */
    RESEND_API_KEY: z.string().optional(),
    /** Verified sender, e.g. "Kabeer <orders@kabeertheethnicstore.com>". */
    EMAIL_FROM: z.string().optional(),
    EMAIL_REPLY_TO: z.string().optional(),
    /** How long an emailed one-time code stays usable. */
    OTP_TTL_MINUTES: z.coerce.number().int().min(2).max(60).default(10),
    /** Wrong guesses allowed before a code is burned. */
    OTP_MAX_ATTEMPTS: z.coerce.number().int().min(3).max(10).default(5),

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

/**
 * An origin is scheme + host + port and nothing else. Browsers send exactly
 * that in the Origin header, and the CORS and CSRF checks compare it as a
 * string — so a trailing slash or a stray path in the configuration would
 * silently reject every request from the real storefront. Normalising here
 * makes "https://shop.example.com/" and "https://shop.example.com" equivalent.
 * Anything unparseable is dropped rather than half-matched.
 */
function toOrigin(value) {
  try {
    return new URL(value.trim()).origin;
  } catch {
    return null;
  }
}

/**
 * FRONTEND_URL is the storefront, so it is always allowed to call the API;
 * CORS_ORIGINS adds any others (a second domain, preview deployments).
 * Keeping them in one list means setting one without the other cannot produce
 * a store that silently fails on every write.
 */
const corsOrigins = [
  ...new Set(
    [raw.FRONTEND_URL, ...raw.CORS_ORIGINS.split(',')].map(toOrigin).filter(Boolean),
  ),
];

export const env = {
  ...raw,
  isProduction,
  isTest: raw.NODE_ENV === 'test',
  corsOrigins,
  cookieSecure: raw.COOKIE_SECURE ?? isProduction,
  /** Razorpay is optional at boot; checkout reports it clearly when missing. */
  razorpayEnabled: Boolean(raw.RAZORPAY_KEY_ID && raw.RAZORPAY_KEY_SECRET),
  supabaseKey,
  storageEnabled: Boolean(raw.SUPABASE_URL && supabaseKey),
  /** Email is optional at boot; the flows that need it say so explicitly. */
  emailEnabled: Boolean(raw.RESEND_API_KEY && raw.EMAIL_FROM),
};

export default env;
