import './setup.js';

import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';

import { buildApp } from '../src/app.js';

/**
 * Wire-level checks that never reach the database: routing, authorization,
 * CSRF and request validation all reject before any query runs.
 */
let app;

before(async () => {
  app = await buildApp();
  await app.ready();
});

after(async () => {
  await app.close();
});

describe('routing', () => {
  it('returns a structured 404 for unknown routes', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/not-a-route' });

    assert.equal(response.statusCode, 404);
    assert.equal(response.json().error.code, 'NOT_FOUND');
  });

  it('reports whether online payments are configured', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/payments/config' });

    assert.equal(response.statusCode, 200);
    assert.equal(response.json().data.provider, 'razorpay');
  });
});

describe('authorization', () => {
  const adminRoutes = [
    '/api/admin/dashboard',
    '/api/admin/products',
    '/api/admin/orders',
    '/api/admin/customers',
    '/api/admin/coupons',
    '/api/admin/content/pages',
  ];

  for (const url of adminRoutes) {
    it(`rejects anonymous access to ${url}`, async () => {
      const response = await app.inject({ method: 'GET', url });

      assert.equal(response.statusCode, 401);
      assert.equal(response.json().error.code, 'UNAUTHORIZED');
    });
  }

  it('rejects anonymous access to customer-only routes', async () => {
    for (const url of ['/api/orders', '/api/users/addresses', '/api/users/wishlist']) {
      const response = await app.inject({ method: 'GET', url });
      assert.equal(response.statusCode, 401, url);
    }
  });
});

describe('CSRF protection', () => {
  it('rejects a state-changing request from an unknown origin', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      headers: { origin: 'https://evil.example' },
      payload: { email: 'someone@example.com', password: 'password12345' },
    });

    assert.equal(response.statusCode, 403);
    assert.equal(response.json().error.code, 'FORBIDDEN');
  });

  it('allows a request from the configured storefront origin', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      headers: { origin: 'http://localhost:5173' },
      payload: { name: 'A', email: 'not-an-email', password: 'short' },
    });

    // Reaches validation rather than being blocked as cross-site.
    assert.equal(response.statusCode, 422);
  });
});

describe('request validation', () => {
  it('reports invalid registration fields without touching the database', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { name: 'A', email: 'nope', password: 'short' },
    });

    assert.equal(response.statusCode, 422);

    const fields = response.json().error.details.map((issue) => issue.field);
    assert.deepEqual(fields.sort(), ['email', 'name', 'password']);
  });

  it('rejects an oversized JSON body', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { name: 'x'.repeat(2 * 1024 * 1024) },
    });

    assert.equal(response.statusCode, 413);
  });
});

describe('webhooks', () => {
  it('rejects a Razorpay webhook with a bad signature', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/webhooks/razorpay',
      headers: { 'x-razorpay-signature': 'deadbeef', 'content-type': 'application/json' },
      payload: JSON.stringify({ event: 'payment.captured' }),
    });

    assert.equal(response.statusCode, 400);
    assert.equal(response.json().error.code, 'BAD_REQUEST');
  });
});
