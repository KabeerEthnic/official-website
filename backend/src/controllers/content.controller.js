import { serializePage } from '../lib/serialize.js';
import { getPage, listPages } from '../services/content.service.js';
import { pageParamsSchema } from '../validators/content.validator.js';
import { parse } from '../validators/common.js';

export async function getPublicPage(request, reply) {
  const { slug } = parse(pageParamsSchema, request.params);
  const page = await getPage(slug);

  // Page content changes rarely and is identical for everyone, so a short
  // shared cache window keeps the storefront fast without going stale.
  reply.header('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');

  return reply.send({ data: serializePage(page) });
}

export async function getPublicPages(request, reply) {
  const pages = await listPages();
  return reply.send({ data: pages.map((page) => ({ slug: page.slug, title: page.title })) });
}
