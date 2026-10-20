import prisma from '../lib/prisma.js';

const CURTAIN_ID = 'site';

/*
 * Every storefront visit asks for the curtain, so the row is held in memory
 * for a few seconds. A write on this instance refreshes it at once; other
 * instances catch up within CACHE_MS.
 */
const CACHE_MS = 5_000;
let cached = null;
let cachedAt = 0;

function remember(curtain) {
  cached = curtain;
  cachedAt = Date.now();
  return curtain;
}

/** The curtain row, created with its defaults (curtain up) on first read. */
export async function getCurtain({ fresh = false } = {}) {
  if (!fresh && cached && Date.now() - cachedAt < CACHE_MS) return cached;

  const curtain = await prisma.siteCurtain.upsert({
    where: { id: CURTAIN_ID },
    create: { id: CURTAIN_ID },
    update: {},
  });

  return remember(curtain);
}

export async function isCurtainDown() {
  const curtain = await getCurtain();
  return curtain.enabled;
}

/**
 * Drops or lifts the curtain and/or changes its wording. `droppedAt` only
 * moves when the curtain actually goes down, so it reads as "closed since".
 */
export async function updateCurtain({ enabled, title, message, actorEmail }) {
  const current = await getCurtain({ fresh: true });
  const dropping = enabled === true && !current.enabled;

  const curtain = await prisma.siteCurtain.update({
    where: { id: CURTAIN_ID },
    data: {
      ...(enabled !== undefined ? { enabled } : {}),
      ...(title !== undefined ? { title } : {}),
      ...(message !== undefined ? { message } : {}),
      ...(dropping ? { droppedAt: new Date() } : {}),
      ...(enabled === false ? { droppedAt: null } : {}),
      updatedBy: actorEmail ?? null,
    },
  });

  return { before: current, curtain: remember(curtain) };
}
