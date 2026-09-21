import './setup.js';

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { percentOf, rupeesToPaise } from '../src/lib/money.js';
import { calculateDiscount } from '../src/services/coupon.service.js';
import { priceOrder } from '../src/services/order.service.js';

const line = (unitPrice, quantity) => ({ unitPrice, quantity });

describe('money helpers', () => {
  it('converts rupees to paise without floating point drift', () => {
    assert.equal(rupeesToPaise(14999), 1499900);
    assert.equal(rupeesToPaise(1450.5), 145050);
    assert.equal(rupeesToPaise(0.1), 10);
  });

  it('rounds percentages to whole paise', () => {
    assert.equal(percentOf(1499900, 5), 74995);
    assert.equal(percentOf(333, 5), 17);
  });
});

describe('priceOrder', () => {
  it('sums line totals into the subtotal', () => {
    const totals = priceOrder({ items: [line(1499900, 1), line(349900, 2)] });
    assert.equal(totals.subtotal, 1499900 + 349900 * 2);
  });

  it('applies tax after the discount, never before', () => {
    const withoutDiscount = priceOrder({ items: [line(100000, 1)] });
    const withDiscount = priceOrder({ items: [line(100000, 1)], discount: 50000 });

    assert.equal(withoutDiscount.tax, percentOf(100000, 5));
    assert.equal(withDiscount.tax, percentOf(50000, 5));
  });

  it('keeps total consistent with its parts', () => {
    const totals = priceOrder({ items: [line(250000, 3)], discount: 25000 });
    assert.equal(totals.total, totals.subtotal - totals.discount + totals.shipping + totals.tax);
  });

  it('never produces a negative total', () => {
    const totals = priceOrder({ items: [line(10000, 1)], discount: 10000 });
    assert.equal(totals.total, 0);
  });
});

describe('calculateDiscount', () => {
  const percentage = { discountType: 'PERCENTAGE', value: 20, maxDiscount: null };
  const fixed = { discountType: 'FIXED', value: 50000, maxDiscount: null };

  it('takes a percentage of the subtotal', () => {
    assert.equal(calculateDiscount(percentage, 500000), 100000);
  });

  it('honours the cap on a percentage coupon', () => {
    assert.equal(calculateDiscount({ ...percentage, maxDiscount: 20000 }, 500000), 20000);
  });

  it('applies a fixed amount as-is', () => {
    assert.equal(calculateDiscount(fixed, 500000), 50000);
  });

  it('never discounts more than the subtotal', () => {
    assert.equal(calculateDiscount(fixed, 30000), 30000);
  });
});
