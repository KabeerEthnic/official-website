import prisma from '../lib/prisma.js';
import { badRequest, conflict, notFound } from '../lib/errors.js';
import { slugify, uniqueSlug } from '../lib/slug.js';
import { deleteImage } from '../lib/storage.js';
import { PRODUCT_INCLUDE } from './product.service.js';

const ADMIN_PRODUCT_INCLUDE = {
  category: { select: { id: true, name: true, slug: true } },
  images: { orderBy: { position: 'asc' } },
  inventory: true,
};

const slugTaken = (model, ignoreId) => async (candidate) => {
  const row = await prisma[model].findUnique({ where: { slug: candidate }, select: { id: true } });
  return Boolean(row) && row.id !== ignoreId;
};

function assertPricing({ price, salePrice }) {
  if (salePrice !== undefined && salePrice !== null && price !== undefined && salePrice >= price) {
    throw badRequest('The sale price must be lower than the regular price');
  }
}

/* -------------------------------------------------------------- categories */

export function listCategories({ admin = false } = {}) {
  return prisma.category.findMany({
    where: admin ? {} : { visible: true },
    orderBy: [{ position: 'asc' }, { name: 'asc' }],
    ...(admin ? { include: { _count: { select: { products: true } } } } : {}),
  });
}

export async function createCategory(input) {
  return prisma.category.create({
    data: { ...input, slug: await uniqueSlug(input.slug || input.name, slugTaken('category')) },
  });
}

export async function updateCategory(id, input) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw notFound('Category not found');

  const slug =
    input.slug && slugify(input.slug) !== category.slug
      ? await uniqueSlug(input.slug, slugTaken('category', id))
      : undefined;

  return prisma.category.update({ where: { id }, data: { ...input, ...(slug ? { slug } : {}) } });
}

export async function deleteCategory(id) {
  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) {
    throw conflict(
      `This category still holds ${count} product${count === 1 ? '' : 's'}. Move them first.`,
    );
  }
  await prisma.category.delete({ where: { id } });
}

/* ---------------------------------------------------------------- products */

export async function createProduct({ inventory, images, ...input }) {
  assertPricing(input);

  const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
  if (!category) throw badRequest('Choose an existing category');

  return prisma.product.create({
    data: {
      ...input,
      slug: await uniqueSlug(input.slug || input.name, slugTaken('product')),
      inventory: {
        create: {
          quantity: inventory?.quantity ?? 0,
          // Default the limited-edition baseline to the opening stock level.
          capacity: inventory?.capacity ?? inventory?.quantity ?? 0,
          lowStockThreshold: inventory?.lowStockThreshold ?? 3,
        },
      },
      ...(images?.length
        ? {
            images: {
              create: images.map((image, index) => ({
                url: image.url,
                storagePath: image.storagePath ?? null,
                altText: image.altText ?? null,
                position: image.position ?? index,
              })),
            },
          }
        : {}),
    },
    include: ADMIN_PRODUCT_INCLUDE,
  });
}

export async function updateProduct(id, { inventory, ...input }) {
  const product = await prisma.product.findUnique({ where: { id }, include: { inventory: true } });
  if (!product) throw notFound('Product not found');

  assertPricing({
    price: input.price ?? product.price,
    salePrice: input.salePrice !== undefined ? input.salePrice : product.salePrice,
  });

  if (input.categoryId && input.categoryId !== product.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
    if (!category) throw badRequest('Choose an existing category');
  }

  const slug =
    input.slug && slugify(input.slug) !== product.slug
      ? await uniqueSlug(input.slug, slugTaken('product', id))
      : undefined;

  return prisma.product.update({
    where: { id },
    data: {
      ...input,
      ...(slug ? { slug } : {}),
      ...(inventory
        ? {
            inventory: {
              upsert: {
                create: {
                  quantity: inventory.quantity ?? 0,
                  capacity: inventory.capacity ?? inventory.quantity ?? 0,
                  lowStockThreshold: inventory.lowStockThreshold ?? 3,
                },
                update: {
                  ...(inventory.quantity !== undefined ? { quantity: inventory.quantity } : {}),
                  ...(inventory.capacity !== undefined ? { capacity: inventory.capacity } : {}),
                  ...(inventory.lowStockThreshold !== undefined
                    ? { lowStockThreshold: inventory.lowStockThreshold }
                    : {}),
                },
              },
            },
          }
        : {}),
    },
    include: ADMIN_PRODUCT_INCLUDE,
  });
}

/** Archiving keeps history intact; it is the safe default for the admin UI. */
export function archiveProduct(id) {
  return prisma.product.update({
    where: { id },
    data: { status: 'ARCHIVED' },
    include: ADMIN_PRODUCT_INCLUDE,
  });
}

/**
 * Hard delete. Order items keep their snapshot and drop the foreign key, so
 * past orders stay readable; stored media is cleaned up afterwards.
 */
export async function deleteProduct(id) {
  const product = await prisma.product.findUnique({ where: { id }, include: { images: true } });
  if (!product) throw notFound('Product not found');

  await prisma.product.delete({ where: { id } });

  await Promise.all(
    product.images.filter((image) => image.storagePath).map((image) => deleteImage(image.storagePath)),
  );
}

export async function addProductImages(productId, images) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { images: { orderBy: { position: 'desc' }, take: 1 } },
  });
  if (!product) throw notFound('Product not found');

  const start = (product.images[0]?.position ?? -1) + 1;

  await prisma.productImage.createMany({
    data: images.map((image, index) => ({
      productId,
      url: image.url,
      storagePath: image.storagePath ?? null,
      altText: image.altText ?? null,
      position: start + index,
    })),
  });

  return prisma.product.findUnique({ where: { id: productId }, include: ADMIN_PRODUCT_INCLUDE });
}

export async function removeProductImage(imageId) {
  const image = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!image) throw notFound('Image not found');

  await prisma.productImage.delete({ where: { id: imageId } });
  if (image.storagePath) await deleteImage(image.storagePath);

  return prisma.product.findUnique({
    where: { id: image.productId },
    include: ADMIN_PRODUCT_INCLUDE,
  });
}

export async function reorderProductImages(productId, imageIds) {
  const images = await prisma.productImage.findMany({ where: { productId }, select: { id: true } });
  const known = new Set(images.map((image) => image.id));

  if (imageIds.length !== known.size || imageIds.some((id) => !known.has(id))) {
    throw badRequest('The new order must list every image on this product exactly once');
  }

  await prisma.$transaction(
    imageIds.map((id, index) => prisma.productImage.update({ where: { id }, data: { position: index } })),
  );

  return prisma.product.findUnique({ where: { id: productId }, include: ADMIN_PRODUCT_INCLUDE });
}

/**
 * Absolute stock level. `reserved` is left alone — it belongs to orders that
 * are mid-checkout and is settled by the order service.
 */
export async function setStock(productId, { quantity, capacity, lowStockThreshold }) {
  const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
  if (!product) throw notFound('Product not found');

  return prisma.inventory.upsert({
    where: { productId },
    create: {
      productId,
      quantity: quantity ?? 0,
      capacity: capacity ?? quantity ?? 0,
      lowStockThreshold: lowStockThreshold ?? 3,
    },
    update: {
      ...(quantity !== undefined ? { quantity } : {}),
      ...(capacity !== undefined ? { capacity } : {}),
      ...(lowStockThreshold !== undefined ? { lowStockThreshold } : {}),
    },
  });
}

export { ADMIN_PRODUCT_INCLUDE, PRODUCT_INCLUDE };
