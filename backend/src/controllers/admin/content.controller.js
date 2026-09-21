import { describeSectionTypes } from '../../config/cmsSections.js';
import { serializePage } from '../../lib/serialize.js';
import {
  getPage,
  listPages,
  reorderSections,
  updatePageMeta,
  updateSection,
} from '../../services/content.service.js';
import { parse } from '../../validators/common.js';
import {
  pageParamsSchema,
  reorderSectionsSchema,
  updatePageSchema,
  updateSectionSchema,
} from '../../validators/content.validator.js';

/** Field descriptions the admin UI turns into forms. */
export async function getSectionTypes(request, reply) {
  return reply.send({ data: describeSectionTypes() });
}

export async function listAdminPages(request, reply) {
  const pages = await listPages({ admin: true });
  return reply.send({ data: pages.map((page) => serializePage(page, { admin: true })) });
}

export async function getAdminPage(request, reply) {
  const { slug } = parse(pageParamsSchema, request.params);
  const page = await getPage(slug, { admin: true });

  return reply.send({ data: serializePage(page, { admin: true }) });
}

export async function patchAdminPage(request, reply) {
  const { slug } = parse(pageParamsSchema, request.params);
  const input = parse(updatePageSchema, request.body);

  await updatePageMeta({ slug, ...input });
  const page = await getPage(slug, { admin: true });

  return reply.send({ data: serializePage(page, { admin: true }) });
}

export async function patchAdminSection(request, reply) {
  const { slug } = parse(pageParamsSchema, request.params);
  const input = parse(updateSectionSchema, request.body);

  await updateSection({ pageSlug: slug, key: request.params.key, ...input });
  const page = await getPage(slug, { admin: true });

  return reply.send({ data: serializePage(page, { admin: true }) });
}

export async function putSectionOrder(request, reply) {
  const { slug } = parse(pageParamsSchema, request.params);
  const { keys } = parse(reorderSectionsSchema, request.body);

  const page = await reorderSections({ pageSlug: slug, keys });

  return reply.send({ data: serializePage(page, { admin: true }) });
}
