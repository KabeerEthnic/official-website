import './setup.js';

import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { describe, it } from 'node:test';

import { hashPassword, verifyPassword } from '../src/lib/password.js';
import { verifyCheckoutSignature, verifyWebhookSignature } from '../src/lib/razorpay.js';
import { createToken, hashToken } from '../src/lib/session.js';
import { slugify, uniqueSlug } from '../src/lib/slug.js';

describe('password hashing', () => {
  it('accepts the right password and rejects the wrong one', async () => {
    const hash = await hashPassword('a-good-long-password');

    assert.equal(await verifyPassword('a-good-long-password', hash), true);
    assert.equal(await verifyPassword('a-good-long-passworD', hash), false);
  });

  it('salts every hash, so identical passwords differ on disk', async () => {
    const [first, second] = await Promise.all([hashPassword('same-password'), hashPassword('same-password')]);
    assert.notEqual(first, second);
  });

  it('refuses malformed stored hashes instead of throwing', async () => {
    assert.equal(await verifyPassword('anything', 'not-a-hash'), false);
    assert.equal(await verifyPassword('anything', undefined), false);
  });
});

describe('session tokens', () => {
  it('never stores the raw token', () => {
    const token = createToken();
    const stored = hashToken(token);

    assert.notEqual(stored, token);
    assert.equal(stored, hashToken(token), 'hashing must be deterministic for lookups');
    assert.equal(stored.length, 64);
  });

  it('gives different tokens on every call', () => {
    assert.notEqual(createToken(), createToken());
  });
});

describe('razorpay signatures', () => {
  const razorpayOrderId = 'order_ABC123';
  const razorpayPaymentId = 'pay_XYZ789';

  const validSignature = createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  it('accepts a correctly signed checkout callback', () => {
    assert.equal(
      verifyCheckoutSignature({ razorpayOrderId, razorpayPaymentId, signature: validSignature }),
      true,
    );
  });

  it('rejects a tampered payment id', () => {
    assert.equal(
      verifyCheckoutSignature({
        razorpayOrderId,
        razorpayPaymentId: 'pay_TAMPERED',
        signature: validSignature,
      }),
      false,
    );
  });

  it('rejects a missing signature', () => {
    assert.equal(verifyCheckoutSignature({ razorpayOrderId, razorpayPaymentId, signature: '' }), false);
  });

  it('verifies webhooks over the exact raw body', () => {
    const body = '{"event":"payment.captured"}';
    const signature = createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET).update(body).digest('hex');

    assert.equal(verifyWebhookSignature(body, signature), true);
    assert.equal(verifyWebhookSignature('{"event":"payment.failed"}', signature), false);
  });
});

describe('slugs', () => {
  it('produces url-safe slugs', () => {
    assert.equal(slugify('MIRA — Sage Silk Anarkali'), 'mira-sage-silk-anarkali');
    assert.equal(slugify('  Cord Sets!  '), 'cord-sets');
  });

  it('suffixes until the slug is free', async () => {
    const taken = new Set(['mira', 'mira-2']);
    assert.equal(await uniqueSlug('MIRA', async (candidate) => taken.has(candidate)), 'mira-3');
  });
});
