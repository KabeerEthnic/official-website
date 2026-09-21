import { getSectionType } from '../config/cmsSections.js';
import prisma from '../lib/prisma.js';
import { badRequest, notFound } from '../lib/errors.js';

const SECTION_ORDER = { orderBy: { position: 'asc' } };

export async function getPage(slug, { admin = false } = {}) {
  const page = await prisma.page.findUnique({
    where: { slug },
    include: { sections: SECTION_ORDER },
  });

  if (!page || (!admin && !page.published)) throw notFound('Page not found');
  return page;
}

export function listPages({ admin = false } = {}) {
  return prisma.page.findMany({
    where: admin ? {} : { published: true },
    orderBy: { slug: 'asc' },
    include: admin ? { sections: SECTION_ORDER } : undefined,
  });
}

/**
 * Validates a section payload against its registered type. Content edits can
 * change the words and images a page shows but never its shape, so the
 * hand-built layouts stay intact.
 */
export function validateSectionData(type, data) {
  const definition = getSectionType(type);
  if (!definition) throw badRequest(`Unknown section type "${type}"`);

  const result = definition.schema.safeParse(data ?? {});
  if (!result.success) {
    throw badRequest('This section has invalid content', {
      issues: result.error.issues.map((issue) => ({
        field: issue.path.join('.') || '(root)',
        message: issue.message,
      })),
    });
  }

  return result.data;
}

export async function updateSection({ pageSlug, key, data, visible }) {
  const page = await prisma.page.findUnique({
    where: { slug: pageSlug },
    include: { sections: { where: { key } } },
  });
  if (!page) throw notFound('Page not found');

  const section = page.sections[0];
  if (!section) throw notFound('Section not found');

  return prisma.pageSection.update({
    where: { id: section.id },
    data: {
      ...(data !== undefined ? { data: validateSectionData(section.type, data) } : {}),
      ...(visible !== undefined ? { visible } : {}),
    },
  });
}

export async function reorderSections({ pageSlug, keys }) {
  const page = await prisma.page.findUnique({
    where: { slug: pageSlug },
    include: { sections: true },
  });
  if (!page) throw notFound('Page not found');

  const known = new Set(page.sections.map((section) => section.key));
  if (keys.length !== known.size || keys.some((key) => !known.has(key))) {
    throw badRequest('The new order must list every section on this page exactly once');
  }

  await prisma.$transaction(
    keys.map((key, index) =>
      prisma.pageSection.update({
        where: { pageId_key: { pageId: page.id, key } },
        data: { position: index },
      }),
    ),
  );

  return getPage(pageSlug, { admin: true });
}

export async function updatePageMeta({ slug, title, description, published }) {
  const page = await prisma.page.findUnique({ where: { slug }, select: { id: true } });
  if (!page) throw notFound('Page not found');

  return prisma.page.update({
    where: { id: page.id },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(published !== undefined ? { published } : {}),
    },
  });
}
