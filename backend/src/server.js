import buildApp from './app.js';
import env from './config/env.js';
import prisma from './lib/prisma.js';
import { purgeExpiredSessions } from './services/auth.service.js';
import { purgeExpiredOtps } from './services/otp.service.js';
import { releaseExpiredReservations } from './services/order.service.js';

const MAINTENANCE_INTERVAL_MS = 5 * 60 * 1000;

const app = await buildApp();

/**
 * Housekeeping loop: returns stock held by checkouts that were never paid, and
 * clears dead sessions and spent verification codes. Kept in-process so the
 * deployment stays a single service; move it to a scheduler if the API is ever
 * scaled horizontally.
 */
async function runMaintenance() {
  try {
    const released = await releaseExpiredReservations(app.log);
    if (released > 0) app.log.info({ released }, 'Released expired stock reservations');
    await purgeExpiredSessions();
    await purgeExpiredOtps();
  } catch (error) {
    app.log.error({ err: error }, 'Maintenance sweep failed');
  }
}

const maintenanceTimer = setInterval(runMaintenance, MAINTENANCE_INTERVAL_MS);
maintenanceTimer.unref();

let shuttingDown = false;

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;

  app.log.info({ signal }, 'Shutting down');
  clearInterval(maintenanceTimer);

  try {
    await app.close();
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    app.log.error({ err: error }, 'Failed to shut down cleanly');
    process.exit(1);
  }
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => shutdown(signal));
}

try {
  await app.listen({ port: env.PORT, host: env.HOST });
  await runMaintenance();
} catch (error) {
  app.log.error({ err: error }, 'Failed to start');
  process.exit(1);
}
