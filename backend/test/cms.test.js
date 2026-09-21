import './setup.js';

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { describeSectionTypes, getSectionType } from '../src/config/cmsSections.js';
import { validateSectionData } from '../src/services/content.service.js';
import { categories, pages, products } from '../prisma/seed.data.js';

describe('CMS section registry', () => {
  it('describes every type with form fields for the admin', () => {
    for (const definition of describeSectionTypes()) {
      assert.ok(definition.label, `${definition.type} needs a label`);
      assert.ok(definition.fields.length > 0, `${definition.type} needs fields`);
    }
  });

  it('marks required fields, including inside lists and groups', () => {
    const types = describeSectionTypes();

    const carousel = types.find((t) => t.type === 'categoryCarousel');
    const items = carousel.fields.find((f) => f.name === 'items');
    const byName = Object.fromEntries(items.itemFields.map((f) => [f.name, f.required]));

    assert.equal(carousel.fields.find((f) => f.name === 'title').required, true);
    assert.equal(carousel.fields.find((f) => f.name === 'titleAccent').required, false);
    assert.equal(items.required, true);
    assert.deepEqual(byName, { name: true, description: false, imageUrl: true, href: false });

    // Groups resolve their own object shape.
    const panel = types
      .find((t) => t.type === 'kurtisHero')
      .fields.find((f) => f.name === 'leftPanel');
    assert.equal(panel.itemFields.find((f) => f.name === 'imageUrl').required, true);
    assert.equal(panel.itemFields.find((f) => f.name === 'label').required, false);

    // A blank hero image is allowed there — the page ships its own artwork.
    assert.equal(
      types.find((t) => t.type === 'suitsHero').fields.find((f) => f.name === 'imageUrl').required,
      false,
    );
  });

  it('agrees with the validator about what is required', () => {
    // Every field the form marks required must actually fail validation when
    // left blank, so the asterisks can never drift from the real rules.
    for (const { type, fields } of describeSectionTypes()) {
      for (const field of fields.filter((f) => f.required && f.type !== 'list')) {
        assert.throws(
          () => validateSectionData(type, { [field.name]: '' }),
          `${type}.${field.name} is marked required but validates when blank`,
        );
      }
    }
  });

  it('rejects content that does not match the section type', () => {
    assert.throws(() => validateSectionData('hero', { title: '', imageUrl: 'not-a-url' }));
    assert.throws(() => validateSectionData('does-not-exist', {}));
  });

  it('fills in defaults for optional copy', () => {
    const data = validateSectionData('hero', {
      title: 'Kabeer',
      imageUrl: 'https://example.com/hero.jpg',
    });

    assert.equal(data.title, 'Kabeer');
    assert.equal(data.subtitle, '');
  });
});

describe('seed data', () => {
  it('only references categories that exist', () => {
    const slugs = new Set(categories.map((category) => category.slug));
    for (const product of products) {
      assert.ok(slugs.has(product.categorySlug), `${product.sku} points at an unknown category`);
    }
  });

  it('gives every product a unique SKU and at least one image', () => {
    const skus = new Set();
    for (const product of products) {
      assert.equal(skus.has(product.sku), false, `duplicate SKU ${product.sku}`);
      skus.add(product.sku);
      assert.ok(product.images.length > 0, `${product.sku} has no images`);
      assert.ok(product.price > 0, `${product.sku} has no price`);
      if (product.salePrice) {
        assert.ok(product.salePrice < product.price, `${product.sku} sale price is not a discount`);
      }
    }
  });

  it('keeps stock within the limited-edition batch size', () => {
    for (const product of products) {
      assert.ok(
        product.inventory.quantity <= product.inventory.capacity,
        `${product.sku} has more stock than its batch size`,
      );
    }
  });

  it('ships page content that passes the section validators', () => {
    for (const page of pages) {
      for (const section of page.sections) {
        assert.ok(getSectionType(section.type), `${page.slug}/${section.key} uses an unknown type`);
        validateSectionData(section.type, section.data);
      }
    }
  });
});
