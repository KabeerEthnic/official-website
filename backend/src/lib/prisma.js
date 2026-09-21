import { PrismaClient } from '@prisma/client';

import env from '../config/env.js';

/**
 * A single Prisma client for the process. `--watch` in development reloads the
 * module, so the instance is cached on globalThis to avoid exhausting the
 * database connection pool across reloads.
 */
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.__kabeerPrisma ??
  new PrismaClient({
    log: env.isProduction ? ['warn', 'error'] : ['warn', 'error'],
  });

if (!env.isProduction) {
  globalForPrisma.__kabeerPrisma = prisma;
}

export default prisma;
