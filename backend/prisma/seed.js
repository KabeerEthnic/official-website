/**
 * Seeds a database with the launch catalogue, the page content the storefront
 * was designed around, and — when SEED_ADMIN_* are set — the first
 * administrator.
 *
 * CREATE-ONLY BY DEFAULT. Re-running this never touches a record that already
 * exists, so it cannot undo the owner's work: edited prices, uploaded images,
 * rewritten page content and new products all survive. Only rows that are
 * missing get created, which makes it safe to leave in a deploy pipeline.
 *
 *   npm run db:seed              create what is missing, leave the rest alone
 *   npm run db:seed -- --force   overwrite the seeded records back to the
 *                                launch fixture (destructive — see below)
 *
 * --force rewrites every product, category, coupon and page section listed in
 * seed.data.js back to its shipped values and replaces the images on those
 * products, deleting any uploaded files they referenced. Use it on a scratch
 * database, not on a live store.
 */
import env from '../src/config/env.js';
import { validateSectionData } from '../src/services/content.service.js';
import { hashPassword } from '../src/lib/password.js';
import prisma from '../src/lib/prisma.js';
import { slugify } from '../src/lib/slug.js';
import { deleteImage } from '../src/lib/storage.js';
import { categories, coupons, pages, products } from './seed.data.js';

const FORCE = process.argv.includes('--force') || process.env.SEED_FORCE === 'true';

const log = (...args) => console.log('[seed]', ...args);
const tally = () => ({ created: 0, updated: 0, skipped: 0 });
const report = (label, counts) =>
  log(
    `${label}: ${counts.created} created` +
      (counts.updated ? `, ${counts.updated} overwritten` : '') +
      (counts.skipped ? `, ${counts.skipped} left as they are` : ''),
  );

async function seedCategories() {
  const bySlug = new Map();
  const counts = tally();

  for (const category of categories) {
    const existing = await prisma.category.findUnique({ where: { slug: category.slug } });

    if (existing && !FORCE) {
      bySlug.set(category.slug, existing);
      counts.skipped += 1;
      continue;
    }

    const row = existing
      ? await prisma.category.update({
          where: { id: existing.id },
          data: {
            name: category.name,
            headline: category.headline ?? null,
            description: category.description,
            position: category.position,
          },
        })
      : await prisma.category.create({ data: category });

    bySlug.set(category.slug, row);
    counts[existing ? 'updated' : 'created'] += 1;
  }

  report('categories', counts);
  return bySlug;
}

async function seedProducts(categoriesBySlug) {
  const counts = tally();

  for (const product of products) {
    const existing = await prisma.product.findUnique({
      where: { sku: product.sku },
      include: { images: true },
    });

    if (existing && !FORCE) {
      counts.skipped += 1;
      continue;
    }

    const category = categoriesBySlug.get(product.categorySlug);
    if (!category) throw new Error(`Unknown category "${product.categorySlug}" for ${product.sku}`);

    const data = {
      name: product.name,
      slug: slugify(`${product.name} ${product.subtitle ?? ''}`),
      subtitle: product.subtitle ?? null,
      description: product.description,
      sku: product.sku,
      price: product.price,
      salePrice: product.salePrice ?? null,
      categoryId: category.id,
      status: 'ACTIVE',
      color: product.color ?? null,
      tag: product.tag ?? null,
      details: product.details ?? [],
      featured: product.featured ?? false,
    };

    const row = existing
      ? await prisma.product.update({ where: { id: existing.id }, data })
      : await prisma.product.create({ data });

    await prisma.inventory.upsert({
      where: { productId: row.id },
      create: {
        productId: row.id,
        quantity: product.inventory.quantity,
        capacity: product.inventory.capacity,
      },
      // Stock is operational data, so only --force resets it.
      update: FORCE
        ? { quantity: product.inventory.quantity, capacity: product.inventory.capacity }
        : {},
    });

    // Replacing images means the files they pointed at have to go too,
    // otherwise every --force leaks orphans into the storage bucket.
    if (existing) {
      await prisma.productImage.deleteMany({ where: { productId: row.id } });
      await Promise.all(
        existing.images
          .filter((image) => image.storagePath)
          .map((image) => deleteImage(image.storagePath).catch(() => false)),
      );
    }

    await prisma.productImage.createMany({
      data: product.images.map((url, index) => ({
        productId: row.id,
        url,
        altText: `${product.name} — ${product.subtitle ?? 'product image'}`,
        position: index,
      })),
    });

    counts[existing ? 'updated' : 'created'] += 1;
  }

  report('products', counts);
}

async function seedCoupons() {
  const counts = tally();

  for (const coupon of coupons) {
    const existing = await prisma.coupon.findUnique({ where: { code: coupon.code } });

    if (existing && !FORCE) {
      counts.skipped += 1;
      continue;
    }

    if (existing) await prisma.coupon.update({ where: { id: existing.id }, data: coupon });
    else await prisma.coupon.create({ data: coupon });

    counts[existing ? 'updated' : 'created'] += 1;
  }

  report('coupons', counts);
}

async function seedPages() {
  const pageCounts = tally();
  const sectionCounts = tally();

  for (const page of pages) {
    const existingPage = await prisma.page.findUnique({ where: { slug: page.slug } });

    const row = existingPage
      ? existingPage
      : await prisma.page.create({
          data: { slug: page.slug, title: page.title, description: page.description },
        });

    if (existingPage && FORCE) {
      await prisma.page.update({
        where: { id: row.id },
        data: { title: page.title, description: page.description },
      });
    }

    pageCounts[existingPage ? (FORCE ? 'updated' : 'skipped') : 'created'] += 1;

    for (const [index, section] of page.sections.entries()) {
      // Validate with the same schema the admin API uses, so a drifting seed
      // fails here rather than shipping a broken section.
      const data = validateSectionData(section.type, section.data);

      const existingSection = await prisma.pageSection.findUnique({
        where: { pageId_key: { pageId: row.id, key: section.key } },
      });

      if (existingSection && !FORCE) {
        sectionCounts.skipped += 1;
        continue;
      }

      if (existingSection) {
        await prisma.pageSection.update({
          where: { id: existingSection.id },
          data: { type: section.type, position: index, data },
        });
      } else {
        await prisma.pageSection.create({
          data: { pageId: row.id, key: section.key, type: section.type, position: index, data },
        });
      }

      sectionCounts[existingSection ? 'updated' : 'created'] += 1;
    }
  }

  report('pages', pageCounts);
  report('page sections', sectionCounts);
}

async function seedAdmin() {
  if (!env.SEED_ADMIN_EMAIL || !env.SEED_ADMIN_PASSWORD) {
    log('admin: skipped (set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD to create one)');
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email: env.SEED_ADMIN_EMAIL } });

  if (existing) {
    // Promote an existing account, but never reset a password someone is using.
    if (existing.role !== 'ADMIN' || existing.status !== 'ACTIVE') {
      await prisma.user.update({
        where: { id: existing.id },
        data: { role: 'ADMIN', status: 'ACTIVE' },
      });
      log(`admin: ${env.SEED_ADMIN_EMAIL} promoted`);
    } else {
      log(`admin: ${env.SEED_ADMIN_EMAIL} already set up`);
    }
    return;
  }

  await prisma.user.create({
    data: {
      email: env.SEED_ADMIN_EMAIL,
      name: env.SEED_ADMIN_NAME,
      passwordHash: await hashPassword(env.SEED_ADMIN_PASSWORD),
      role: 'ADMIN',
    },
  });

  log(`admin: ${env.SEED_ADMIN_EMAIL} created`);
}

async function main() {
  if (FORCE) {
    log('--force: seeded records will be reset to their launch values.');
    log('         Edits and uploaded images on those records will be lost.');
  }

  const categoriesBySlug = await seedCategories();
  await seedProducts(categoriesBySlug);
  await seedCoupons();
  await seedPages();
  await seedAdmin();

  log('done');
}

try {
  await main();
} catch (error) {
  console.error('[seed] failed:', error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
