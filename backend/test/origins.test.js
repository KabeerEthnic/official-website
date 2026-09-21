import './setup.js';

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

/**
 * Allowed origins back both CORS and the CSRF guard, and both compare the
 * browser's Origin header as an exact string. A trailing slash in the
 * configuration would therefore reject every request from the real storefront
 * — with a 403 on login, add-to-cart and checkout — so the normalising is
 * worth pinning down.
 */
async function loadEnv(overrides) {
  const previous = { ...process.env };
  Object.assign(process.env, overrides);

  const module = await import(`../src/config/env.js?case=${Math.random()}`);

  process.env = previous;
  return module.env;
}

describe('allowed origins', () => {
  it('ignores a trailing slash, which browsers never send', async () => {
    const env = await loadEnv({
      FRONTEND_URL: 'https://shop.example.com/',
      CORS_ORIGINS: 'https://shop.example.com/',
    });

    assert.deepEqual(env.corsOrigins, ['https://shop.example.com']);
  });

  it('always trusts FRONTEND_URL, even when CORS_ORIGINS omits it', async () => {
    const env = await loadEnv({
      FRONTEND_URL: 'https://shop.example.com',
      CORS_ORIGINS: 'https://admin.example.com',
    });

    assert.ok(env.corsOrigins.includes('https://shop.example.com'));
    assert.ok(env.corsOrigins.includes('https://admin.example.com'));
  });

  it('does not duplicate an origin listed in both', async () => {
    const env = await loadEnv({
      FRONTEND_URL: 'https://shop.example.com',
      CORS_ORIGINS: 'https://shop.example.com,https://shop.example.com/',
    });

    assert.deepEqual(env.corsOrigins, ['https://shop.example.com']);
  });

  it('strips any path, since an origin has none', async () => {
    const env = await loadEnv({
      FRONTEND_URL: 'https://shop.example.com/store/home',
      CORS_ORIGINS: '',
    });

    assert.deepEqual(env.corsOrigins, ['https://shop.example.com']);
  });

  it('keeps the port, which is part of the origin', async () => {
    const env = await loadEnv({
      FRONTEND_URL: 'http://localhost:5173',
      CORS_ORIGINS: 'http://localhost:4173',
    });

    assert.deepEqual(env.corsOrigins, ['http://localhost:5173', 'http://localhost:4173']);
  });

  it('treats www and the apex as different origins, because browsers do', async () => {
    const env = await loadEnv({
      FRONTEND_URL: 'https://www.example.com',
      CORS_ORIGINS: '',
    });

    assert.ok(env.corsOrigins.includes('https://www.example.com'));
    assert.equal(env.corsOrigins.includes('https://example.com'), false);
  });

  it('drops unparseable entries rather than half-matching them', async () => {
    const env = await loadEnv({
      FRONTEND_URL: 'https://shop.example.com',
      CORS_ORIGINS: 'not a url, ,https://other.example.com',
    });

    assert.deepEqual(env.corsOrigins, ['https://shop.example.com', 'https://other.example.com']);
  });
});
