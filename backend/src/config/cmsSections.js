import { z } from 'zod';

/**
 * CMS section registry.
 *
 * Every editable block on the site has a type here. The type owns:
 *   - `schema`  the payload shape, enforced on every admin write
 *   - `label`   what the admin UI calls it
 *   - `fields`  a declarative form description the admin renders
 *
 * Pages stay visually unique: this file only describes *what* content a
 * section carries. How it is rendered stays in the React component that owns
 * the layout, so editing content can never reshape a page.
 */

const url = z.string().trim().url().max(2048);
/** Blank means "keep the image the page ships with". */
const optionalUrl = z.union([url, z.literal('')]).default('');
const text = (max = 240) => z.string().trim().max(max);
const requiredText = (max = 240) => z.string().trim().min(1).max(max);

const field = (name, label, type, extra = {}) => ({ name, label, type, ...extra });

export const SECTION_TYPES = {
  hero: {
    label: 'Homepage hero',
    schema: z.object({
      eyebrow: text(80).default(''),
      title: requiredText(80),
      subtitle: text(120).default(''),
      tagline: text(160).default(''),
      imageUrl: url,
    }),
    fields: [
      field('imageUrl', 'Background image', 'image'),
      field('eyebrow', 'Eyebrow', 'text'),
      field('title', 'Title', 'text'),
      field('subtitle', 'Subtitle', 'text'),
      field('tagline', 'Tagline', 'text'),
    ],
  },

  categoryCarousel: {
    label: 'Collections carousel',
    schema: z.object({
      title: requiredText(80),
      titleAccent: text(80).default(''),
      description: text(240).default(''),
      items: z
        .array(
          z.object({
            name: requiredText(80),
            description: text(160).default(''),
            imageUrl: url,
            href: text(200).default(''),
          }),
        )
        .max(24),
    }),
    fields: [
      field('title', 'Heading', 'text'),
      field('titleAccent', 'Heading accent', 'text'),
      field('description', 'Description', 'textarea'),
      field('items', 'Collections', 'list', {
        itemFields: [
          field('imageUrl', 'Image', 'image'),
          field('name', 'Name', 'text'),
          field('description', 'Description', 'text'),
          field('href', 'Links to', 'text'),
        ],
      }),
    ],
  },

  featuredCollection: {
    label: 'Featured collection',
    schema: z.object({
      titleAccent: text(60).default(''),
      title: requiredText(80),
      description: text(240).default(''),
      ctaLabel: text(60).default(''),
      ctaHref: text(200).default(''),
      limit: z.coerce.number().int().min(2).max(16).default(8),
    }),
    fields: [
      field('titleAccent', 'Heading accent', 'text'),
      field('title', 'Heading', 'text'),
      field('description', 'Description', 'textarea'),
      field('ctaLabel', 'Button label', 'text'),
      field('ctaHref', 'Button links to', 'text'),
      field('limit', 'Products shown', 'number'),
    ],
  },

  aboutSlides: {
    label: 'About — video slides',
    schema: z.object({
      slides: z
        .array(
          z.object({
            videoUrl: url,
            title: requiredText(80),
            highlight: text(60).default(''),
            description: text(600).default(''),
            stats: z
              .array(
                z.object({
                  icon: z.enum(['users', 'sparkles', 'award', 'heart']).default('sparkles'),
                  value: requiredText(24),
                  label: requiredText(60),
                }),
              )
              .max(4)
              .default([]),
          }),
        )
        .min(1)
        .max(6),
    }),
    fields: [
      field('slides', 'Slides', 'list', {
        itemFields: [
          field('videoUrl', 'Video URL', 'text'),
          field('title', 'Title', 'text'),
          field('highlight', 'Highlighted word', 'text'),
          field('description', 'Description', 'textarea'),
          field('stats', 'Stats', 'list', {
            itemFields: [
              field('icon', 'Icon', 'select', {
                options: ['users', 'sparkles', 'award', 'heart'],
              }),
              field('value', 'Value', 'text'),
              field('label', 'Label', 'text'),
            ],
          }),
        ],
      }),
    ],
  },

  exhibitions: {
    label: 'Journey / exhibitions',
    schema: z.object({
      titlePrefix: text(40).default(''),
      titleAccent: text(40).default(''),
      titleSuffix: text(60).default(''),
      description: text(240).default(''),
      items: z
        .array(
          z.object({
            image: url,
            title: requiredText(120),
            subtitle: text(120).default(''),
            location: text(120).default(''),
            year: text(12).default(''),
            description: text(600).default(''),
            animation: z
              .enum(['zoomIn', 'panLeft', 'panRight', 'zoomOut', 'panUp'])
              .default('zoomIn'),
          }),
        )
        .min(1)
        .max(12),
    }),
    fields: [
      field('titlePrefix', 'Heading start', 'text'),
      field('titleAccent', 'Heading accent', 'text'),
      field('titleSuffix', 'Heading end', 'text'),
      field('description', 'Description', 'textarea'),
      field('items', 'Milestones', 'list', {
        itemFields: [
          field('image', 'Image', 'image'),
          field('title', 'Title', 'text'),
          field('subtitle', 'Subtitle', 'text'),
          field('location', 'Location', 'text'),
          field('year', 'Year', 'text'),
          field('description', 'Description', 'textarea'),
          field('animation', 'Motion style', 'select', {
            options: ['zoomIn', 'panLeft', 'panRight', 'zoomOut', 'panUp'],
          }),
        ],
      }),
    ],
  },

  newsletter: {
    label: 'Newsletter',
    schema: z.object({
      title: requiredText(120),
      titleAccent: text(60).default(''),
      description: text(400).default(''),
      buttonLabel: text(40).default('Subscribe'),
      note: text(160).default(''),
    }),
    fields: [
      field('title', 'Heading', 'text'),
      field('titleAccent', 'Heading accent', 'text'),
      field('description', 'Description', 'textarea'),
      field('buttonLabel', 'Button label', 'text'),
      field('note', 'Small print', 'text'),
    ],
  },

  bagsHero: {
    label: 'Bags — hero',
    schema: z.object({
      eyebrow: text(80).default(''),
      title: requiredText(120),
      subtitle: text(300).default(''),
      imageUrl: url,
    }),
    fields: [
      field('imageUrl', 'Background image', 'image'),
      field('eyebrow', 'Eyebrow', 'text'),
      field('title', 'Title', 'text'),
      field('subtitle', 'Subtitle', 'textarea'),
    ],
  },

  suitsHero: {
    label: 'Suits lookbook — hero',
    schema: z.object({
      eyebrow: text(80).default(''),
      title: requiredText(160),
      subtitle: text(300).default(''),
      imageUrl: optionalUrl,
    }),
    fields: [
      field('imageUrl', 'Hero image', 'image'),
      field('eyebrow', 'Eyebrow', 'text'),
      field('title', 'Title', 'text'),
      field('subtitle', 'Subtitle', 'textarea'),
    ],
  },

  kurtisHero: {
    label: 'Kurtis — editorial hero',
    schema: z.object({
      eyebrow: text(80).default(''),
      title: requiredText(60),
      titleAccent: text(60).default(''),
      quote: text(400).default(''),
      promoBadge: text(60).default(''),
      promoTitle: text(120).default(''),
      promoDescription: text(240).default(''),
      promoCode: text(32).default(''),
      leftPanel: z.object({ label: text(60).default(''), title: text(60).default(''), imageUrl: url }),
      centerPanel: z.object({ label: text(60).default(''), title: text(60).default(''), imageUrl: url }),
      rightPanel: z.object({ label: text(60).default(''), title: text(60).default(''), imageUrl: url }),
    }),
    fields: [
      field('eyebrow', 'Eyebrow', 'text'),
      field('title', 'Title', 'text'),
      field('titleAccent', 'Title accent', 'text'),
      field('quote', 'Quote', 'textarea'),
      field('promoBadge', 'Promo badge', 'text'),
      field('promoTitle', 'Promo title', 'text'),
      field('promoDescription', 'Promo description', 'textarea'),
      field('promoCode', 'Promo code', 'text'),
      field('leftPanel', 'Left panel', 'group', {
        itemFields: [
          field('imageUrl', 'Image', 'image'),
          field('label', 'Label', 'text'),
          field('title', 'Title', 'text'),
        ],
      }),
      field('centerPanel', 'Centre panel', 'group', {
        itemFields: [
          field('imageUrl', 'Image', 'image'),
          field('label', 'Label', 'text'),
          field('title', 'Title', 'text'),
        ],
      }),
      field('rightPanel', 'Right panel', 'group', {
        itemFields: [
          field('imageUrl', 'Image', 'image'),
          field('label', 'Label', 'text'),
          field('title', 'Title', 'text'),
        ],
      }),
    ],
  },

  cordSetsHero: {
    label: 'Cord sets — split hero',
    schema: z.object({
      badge: text(60).default(''),
      eyebrow: text(60).default(''),
      title: requiredText(40),
      titleAccent: text(40).default(''),
      tagline: text(160).default(''),
      taglineMuted: text(160).default(''),
      ctaLabel: text(40).default(''),
      imageUrl: optionalUrl,
      marquee: z.array(requiredText(60)).max(16).default([]),
      stats: z
        .array(z.object({ value: requiredText(16), label: requiredText(40), accent: z.boolean().default(false) }))
        .max(4)
        .default([]),
    }),
    fields: [
      field('imageUrl', 'Hero image', 'image'),
      field('badge', 'Badge', 'text'),
      field('eyebrow', 'Eyebrow', 'text'),
      field('title', 'Title', 'text'),
      field('titleAccent', 'Title accent', 'text'),
      field('tagline', 'Tagline', 'text'),
      field('taglineMuted', 'Tagline (muted line)', 'text'),
      field('ctaLabel', 'Button label', 'text'),
      field('marquee', 'Marquee words', 'stringList'),
      field('stats', 'Stats', 'list', {
        itemFields: [
          field('value', 'Value', 'text'),
          field('label', 'Label', 'text'),
          field('accent', 'Highlight', 'boolean'),
        ],
      }),
    ],
  },

  pullQuote: {
    label: 'Pull quote',
    schema: z.object({
      eyebrow: text(60).default(''),
      quote: requiredText(600),
      attribution: text(120).default(''),
    }),
    fields: [
      field('eyebrow', 'Eyebrow', 'text'),
      field('quote', 'Quote', 'textarea'),
      field('attribution', 'Attribution', 'text'),
    ],
  },

  testimonials: {
    label: 'Customer words',
    schema: z.object({
      eyebrow: text(60).default(''),
      items: z
        .array(
          z.object({
            quote: requiredText(600),
            name: requiredText(80),
            location: text(80).default(''),
            avatarUrl: optionalUrl,
            rating: z.coerce.number().int().min(1).max(5).default(5),
          }),
        )
        .max(12)
        .default([]),
    }),
    fields: [
      field('eyebrow', 'Eyebrow', 'text'),
      field('items', 'Testimonials', 'list', {
        itemFields: [
          field('quote', 'Quote', 'textarea'),
          field('name', 'Customer name', 'text'),
          field('location', 'Location', 'text'),
          field('avatarUrl', 'Photo', 'image'),
          field('rating', 'Rating out of 5', 'number'),
        ],
      }),
    ],
  },

  richText: {
    label: 'Heading + body copy',
    schema: z.object({
      title: requiredText(120),
      titleAccent: text(60).default(''),
      body: text(2000).default(''),
    }),
    fields: [
      field('title', 'Heading', 'text'),
      field('titleAccent', 'Heading accent', 'text'),
      field('body', 'Body', 'textarea'),
    ],
  },
};

export const sectionTypeNames = Object.keys(SECTION_TYPES);

export function getSectionType(type) {
  return SECTION_TYPES[type] ?? null;
}

/** Unwraps .default()/.optional() wrappers to reach the underlying schema. */
function inner(schema) {
  let current = schema;
  while (current?._def?.innerType) current = current._def.innerType;
  return current;
}

/**
 * The object shape behind a field: the element type for a list, or the object
 * itself for a group. Returns null for plain scalar fields.
 */
function shapeOf(schema) {
  const base = inner(schema);
  if (!base) return null;
  if (base._def?.typeName === 'ZodArray') return inner(base.element)?.shape ?? null;
  return base.shape ?? null;
}

/**
 * Marks each form field required or not by asking its own Zod schema, so the
 * admin's hints can never drift from what the API actually enforces.
 */
function annotate(fields, shape) {
  return fields.map((field) => {
    const child = shape?.[field.name];
    return {
      ...field,
      required: child ? !child.isOptional() : false,
      ...(field.itemFields ? { itemFields: annotate(field.itemFields, shapeOf(child)) } : {}),
    };
  });
}

/** Admin-facing description of every section type, for building forms. */
export function describeSectionTypes() {
  return Object.entries(SECTION_TYPES).map(([type, definition]) => ({
    type,
    label: definition.label,
    fields: annotate(definition.fields, definition.schema.shape),
  }));
}
