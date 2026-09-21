import { serializeCategory, serializeProduct } from '../lib/serialize.js';
import { listCategories } from '../services/catalog.service.js';
import {
  getProductBySlug,
  listColorFacets,
  listProducts,
  listRelatedProducts,
} from '../services/product.service.js';
import { listProductReviews } from '../services/review.service.js';
import { categoryQuerySchema, productQuerySchema } from '../validators/catalog.validator.js';
import { paginationSchema, parse } from '../validators/common.js';
import { serializeReview } from '../lib/serialize.js';

export async function getProducts(request, reply) {
  const filters = parse(productQuerySchema, request.query);
  const { items, pagination } = await listProducts(filters);

  return reply.send({
    data: items.map((product) => serializeProduct(product)),
    meta: { pagination },
  });
}

export async function getProduct(request, reply) {
  const product = await getProductBySlug(request.params.slug);
  const related = await listRelatedProducts(product);

  return reply.send({
    data: {
      ...serializeProduct(product),
      related: related.map((item) => serializeProduct(item)),
    },
  });
}

export async function getProductReviews(request, reply) {
  const product = await getProductBySlug(request.params.slug);
  const { page, limit } = parse(paginationSchema, request.query);
  const { items, pagination } = await listProductReviews(product.id, { page, limit });

  return reply.send({
    data: items.map((review) => serializeReview(review)),
    meta: { pagination },
  });
}

export async function getCategories(request, reply) {
  parse(categoryQuerySchema, request.query);
  const categories = await listCategories();

  return reply.send({ data: categories.map(serializeCategory) });
}

/** Facets the shop sidebar needs to build its filters without guessing. */
export async function getFilters(request, reply) {
  const { category } = parse(productQuerySchema.pick({ category: true }), request.query);
  const [categories, colors] = await Promise.all([listCategories(), listColorFacets(category)]);

  return reply.send({
    data: {
      categories: categories.map(serializeCategory),
      colors,
    },
  });
}
