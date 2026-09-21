import prisma from '../../lib/prisma.js';
import { serializeCategory, serializeProduct } from '../../lib/serialize.js';
import {
  ADMIN_PRODUCT_INCLUDE,
  addProductImages,
  archiveProduct,
  createCategory,
  createProduct,
  deleteCategory,
  deleteProduct,
  listCategories,
  removeProductImage,
  reorderProductImages,
  setStock,
  updateCategory,
  updateProduct,
} from '../../services/catalog.service.js';
import { buildProductWhere, getProductById } from '../../services/product.service.js';
import {
  adminProductQuerySchema,
  createCategorySchema,
  createProductSchema,
  productImagesSchema,
  reorderSchema,
  setStockSchema,
  updateCategorySchema,
  updateProductSchema,
} from '../../validators/catalog.validator.js';
import { parse } from '../../validators/common.js';
import { diff, record } from '../../services/audit.service.js';

const rupees = (paise) => `₹${(paise / 100).toLocaleString('en-IN')}`;

const ADMIN_SORTS = {
  newest: [{ createdAt: 'desc' }],
  oldest: [{ createdAt: 'asc' }],
  price_asc: [{ price: 'asc' }],
  price_desc: [{ price: 'desc' }],
  rating: [{ ratingAvg: 'desc' }],
  featured: [{ featured: 'desc' }, { position: 'asc' }, { createdAt: 'desc' }],
};

export async function listAdminProducts(request, reply) {
  const filters = parse(adminProductQuerySchema, request.query);
  const where = buildProductWhere(filters, { includeUnpublished: true });

  const [total, items] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: ADMIN_PRODUCT_INCLUDE,
      orderBy: ADMIN_SORTS[filters.sort] ?? ADMIN_SORTS.newest,
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    }),
  ]);

  return reply.send({
    data: items.map((product) => serializeProduct(product, { admin: true })),
    meta: {
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / filters.limit)),
      },
    },
  });
}

export async function getAdminProduct(request, reply) {
  const product = await getProductById(request.params.id, { includeUnpublished: true });
  return reply.send({ data: serializeProduct(product, { admin: true }) });
}

export async function postProduct(request, reply) {
  const input = parse(createProductSchema, request.body);
  const product = await createProduct(input);

  await record(request, {
    action: 'product.created',
    entityType: 'Product',
    entityId: product.id,
    summary: `Created product ${product.name} (${product.sku}) at ${rupees(product.price)}`,
  });

  return reply.code(201).send({ data: serializeProduct(product, { admin: true }) });
}

export async function patchProduct(request, reply) {
  const input = parse(updateProductSchema, request.body);

  // Read the row first so the audit entry can say what actually changed
  // rather than just that an edit happened.
  const before = await prisma.product.findUnique({ where: { id: request.params.id } });
  const product = await updateProduct(request.params.id, input);

  const changed = diff(before, product, [
    'name', 'sku', 'price', 'salePrice', 'status', 'categoryId', 'featured', 'color', 'tag',
  ]);

  await record(request, {
    action: 'product.updated',
    entityType: 'Product',
    entityId: product.id,
    summary:
      changed?.price
        ? `Changed the price of ${product.name} from ${rupees(changed.price.from)} to ${rupees(changed.price.to)}`
        : `Updated product ${product.name} (${Object.keys(changed ?? {}).join(', ') || 'no tracked fields'})`,
    metadata: changed,
  });

  return reply.send({ data: serializeProduct(product, { admin: true }) });
}

export async function postArchiveProduct(request, reply) {
  const product = await archiveProduct(request.params.id);

  await record(request, {
    action: 'product.archived',
    entityType: 'Product',
    entityId: product.id,
    summary: `Archived product ${product.name} (${product.sku})`,
  });

  return reply.send({ data: serializeProduct(product, { admin: true }) });
}

export async function deleteAdminProduct(request, reply) {
  const before = await prisma.product.findUnique({ where: { id: request.params.id } });
  await deleteProduct(request.params.id);

  await record(request, {
    action: 'product.deleted',
    entityType: 'Product',
    entityId: request.params.id,
    summary: `Deleted product ${before?.name ?? 'unknown'} (${before?.sku ?? '—'})`,
  });

  return reply.send({ data: { success: true } });
}

export async function postProductImages(request, reply) {
  const { images } = parse(productImagesSchema, request.body);
  const product = await addProductImages(request.params.id, images);

  return reply.code(201).send({ data: serializeProduct(product, { admin: true }) });
}

export async function deleteProductImage(request, reply) {
  const product = await removeProductImage(request.params.imageId);
  return reply.send({ data: serializeProduct(product, { admin: true }) });
}

export async function putProductImageOrder(request, reply) {
  const { ids } = parse(reorderSchema, request.body);
  const product = await reorderProductImages(request.params.id, ids);

  return reply.send({ data: serializeProduct(product, { admin: true }) });
}

export async function putStock(request, reply) {
  const input = parse(setStockSchema, request.body);

  const before = await prisma.inventory.findUnique({ where: { productId: request.params.id } });
  await setStock(request.params.id, input);

  const product = await getProductById(request.params.id, { includeUnpublished: true });

  await record(request, {
    action: 'inventory.adjusted',
    entityType: 'Product',
    entityId: product.id,
    summary:
      input.quantity !== undefined
        ? `Set stock for ${product.name} from ${before?.quantity ?? 0} to ${input.quantity}`
        : `Adjusted inventory settings for ${product.name}`,
    metadata: diff(before, product.inventory, ['quantity', 'capacity', 'lowStockThreshold']),
  });

  return reply.send({ data: serializeProduct(product, { admin: true }) });
}

/* ------------------------------------------------------------- categories */

export async function listAdminCategories(request, reply) {
  const categories = await listCategories({ admin: true });
  return reply.send({ data: categories.map(serializeCategory) });
}

export async function postCategory(request, reply) {
  const input = parse(createCategorySchema, request.body);
  const category = await createCategory({ ...input, imageUrl: input.imageUrl || null });

  return reply.code(201).send({ data: serializeCategory(category) });
}

export async function patchCategory(request, reply) {
  const input = parse(updateCategorySchema, request.body);
  const category = await updateCategory(request.params.id, {
    ...input,
    ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl || null } : {}),
  });

  return reply.send({ data: serializeCategory(category) });
}

export async function deleteAdminCategory(request, reply) {
  const before = await prisma.category.findUnique({ where: { id: request.params.id } });
  await deleteCategory(request.params.id);

  await record(request, {
    action: 'category.deleted',
    entityType: 'Category',
    entityId: request.params.id,
    summary: `Deleted collection ${before?.name ?? 'unknown'}`,
  });

  return reply.send({ data: { success: true } });
}
