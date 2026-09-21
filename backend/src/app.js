import compress from '@fastify/compress';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import Fastify from 'fastify';

import env from './config/env.js';
import prisma from './lib/prisma.js';
import { registerCsrfGuard } from './middleware/csrf.js';
import { registerErrorHandler } from './middleware/errorHandler.js';
import registerRoutes from './routes/index.js';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      // Never log credentials or session material.
      redact: ['req.headers.cookie', 'req.headers.authorization', 'req.body.password'],
      ...(env.isProduction
        ? {}
        : { transport: undefined, serializers: { req: (r) => ({ method: r.method, url: r.url }) } }),
    },
    trustProxy: true,
    // Cap request bodies well below anything that could exhaust memory.
    bodyLimit: env.MAX_BODY_BYTES,
    disableRequestLogging: env.isProduction,
  });

  // This is a JSON API consumed by a separate origin; the CSP that matters is
  // the storefront's. These headers still harden direct responses.
  await app.register(helmet, { contentSecurityPolicy: false, crossOriginResourcePolicy: false });

  await app.register(cors, {
    origin(origin, callback) {
      // Same-origin and server-to-server requests arrive without an Origin.
      // A disallowed origin simply gets no CORS headers (so the browser blocks
      // the response); the CSRF guard then answers mutations with a clean 403
      // rather than letting this turn into a 500.
      callback(null, !origin || env.corsOrigins.includes(origin));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    maxAge: 86400,
  });

  await app.register(cookie, { secret: env.AUTH_SECRET });
  await app.register(compress, { global: true, threshold: 1024, encodings: ['br', 'gzip'] });

  await app.register(rateLimit, {
    global: true,
    max: 300,
    timeWindow: '1 minute',
    // Anonymous traffic is grouped by IP; signed-in traffic by session, so one
    // shared office IP cannot lock out everyone behind it.
    keyGenerator: (request) => request.cookies?.kes_session ?? request.ip,
    errorResponseBuilder: () => ({
      error: { code: 'RATE_LIMITED', message: 'Too many requests. Please slow down.' },
    }),
  });

  await app.register(multipart, {
    limits: { fileSize: env.MAX_UPLOAD_BYTES, files: 1, fields: 8 },
  });

  registerCsrfGuard(app);
  registerErrorHandler(app);

  app.get('/health', async () => {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', uptime: Math.round(process.uptime()) };
  });

  await registerRoutes(app);

  return app;
}

export default buildApp;
