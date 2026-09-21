import './setup.js';

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

/**
 * Storage credentials. The publishable key must never be accepted server-side,
 * and the legacy service_role JWT has to keep working while Supabase retires it.
 */
async function loadEnv(overrides) {
  const previous = { ...process.env };
  Object.assign(process.env, overrides);

  // A fresh query string forces a new module instance per case.
  const module = await import(`../src/config/env.js?case=${Math.random()}`);

  process.env = previous;
  return module.env;
}

describe('supabase key selection', () => {
  it('prefers the current secret key', async () => {
    const env = await loadEnv({
      SUPABASE_URL: 'https://project.supabase.co',
      SUPABASE_SECRET_KEY: 'sb_secret_abc123',
      SUPABASE_SERVICE_ROLE_KEY: 'legacy.jwt.value',
    });

    assert.equal(env.supabaseKey, 'sb_secret_abc123');
    assert.equal(env.storageEnabled, true);
  });

  it('still accepts the legacy service_role key on its own', async () => {
    const env = await loadEnv({
      SUPABASE_URL: 'https://project.supabase.co',
      SUPABASE_SECRET_KEY: '',
      SUPABASE_SERVICE_ROLE_KEY: 'legacy.jwt.value',
    });

    assert.equal(env.supabaseKey, 'legacy.jwt.value');
    assert.equal(env.storageEnabled, true);
  });

  it('reports storage as unconfigured when no key is set', async () => {
    const env = await loadEnv({
      SUPABASE_URL: 'https://project.supabase.co',
      SUPABASE_SECRET_KEY: '',
      SUPABASE_SERVICE_ROLE_KEY: '',
    });

    assert.equal(env.supabaseKey, null);
    assert.equal(env.storageEnabled, false);
  });
});
