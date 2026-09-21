import './setup.js';

import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import env from '../src/config/env.js';
import prisma from '../src/lib/prisma.js';
import { hashPassword } from '../src/lib/password.js';
import { consumeOtp, issueOtp } from '../src/services/otp.service.js';
import { authenticateUser } from '../src/services/auth.service.js';

/**
 * The OTP service is the only thing standing between a stranger and somebody
 * else's account during a password reset, so its rules are worth pinning down:
 * one live code per purpose, a hard attempt cap, an expiry, and a stored value
 * that is useless to anyone who reads the table.
 *
 * Prisma is swapped for an in-memory double rather than a live database — the
 * behaviour under test is the service's, not Postgres's.
 */
const real = { emailOtp: prisma.emailOtp, transaction: prisma.$transaction, user: prisma.user };

afterEach(() => {
  prisma.emailOtp = real.emailOtp;
  prisma.$transaction = real.transaction;
  prisma.user = real.user;
});

/** Just enough of the EmailOtp delegate for the queries the service makes. */
function fakeOtpTable() {
  const rows = [];
  let nextId = 1;

  const matches = (row, where) =>
    (where.email === undefined || row.email === where.email) &&
    (where.purpose === undefined || row.purpose === where.purpose) &&
    (where.consumedAt === undefined || row.consumedAt === where.consumedAt) &&
    (where.id === undefined || row.id === where.id);

  const apply = (row, data) => {
    for (const [key, value] of Object.entries(data)) {
      row[key] = value?.increment === undefined ? value : row[key] + value.increment;
    }
  };

  prisma.emailOtp = {
    findFirst: async ({ where }) =>
      [...rows].reverse().find((row) => matches(row, where)) ?? null,

    create: async ({ data }) => {
      const row = { id: `otp_${nextId++}`, attempts: 0, consumedAt: null, createdAt: new Date(), ...data };
      rows.push(row);
      return row;
    },

    update: async ({ where, data }) => {
      const row = rows.find((candidate) => candidate.id === where.id);
      apply(row, data);
      return row;
    },

    updateMany: async ({ where, data }) => {
      const hits = rows.filter((row) => matches(row, where));
      hits.forEach((row) => apply(row, data));
      return { count: hits.length };
    },
  };

  // The service passes an array of already-running promises.
  prisma.$transaction = (operations) => Promise.all(operations);

  return rows;
}

/** Moves a stored code back in time, so expiry and cooldown can be exercised. */
function ageRows(rows, seconds) {
  for (const row of rows) {
    row.createdAt = new Date(row.createdAt.getTime() - seconds * 1000);
    row.expiresAt = new Date(row.expiresAt.getTime() - seconds * 1000);
  }
}

const EMAIL = 'shopper@example.com';

describe('one-time codes', () => {
  it('issues six digits and stores only a hash of them', async () => {
    const rows = fakeOtpTable();
    const { code, minutes } = await issueOtp({ email: EMAIL, purpose: 'EMAIL_VERIFICATION' });

    assert.match(code, /^\d{6}$/);
    assert.equal(minutes, env.OTP_TTL_MINUTES);
    assert.equal(rows.length, 1);
    assert.notEqual(rows[0].codeHash, code);
    assert.ok(!JSON.stringify(rows[0]).includes(code), 'the plain code must not survive anywhere');
  });

  it('accepts the right code exactly once', async () => {
    fakeOtpTable();
    const { code } = await issueOtp({ email: EMAIL, purpose: 'EMAIL_VERIFICATION' });

    assert.equal(await consumeOtp({ email: EMAIL, purpose: 'EMAIL_VERIFICATION', code }), true);
    await assert.rejects(
      consumeOtp({ email: EMAIL, purpose: 'EMAIL_VERIFICATION', code }),
      /not valid or has expired/,
    );
  });

  it('ignores case and surrounding space in the address', async () => {
    fakeOtpTable();
    const { code } = await issueOtp({ email: '  Shopper@Example.com ', purpose: 'PASSWORD_RESET' });

    assert.equal(await consumeOtp({ email: EMAIL, purpose: 'PASSWORD_RESET', code }), true);
  });

  it('burns the code once the attempt cap is reached', async () => {
    fakeOtpTable();
    const { code } = await issueOtp({ email: EMAIL, purpose: 'PASSWORD_RESET' });
    const wrong = code === '000000' ? '111111' : '000000';

    for (let attempt = 0; attempt < env.OTP_MAX_ATTEMPTS; attempt += 1) {
      await assert.rejects(consumeOtp({ email: EMAIL, purpose: 'PASSWORD_RESET', code: wrong }));
    }

    // The right code no longer helps: guessing has spent it.
    await assert.rejects(
      consumeOtp({ email: EMAIL, purpose: 'PASSWORD_RESET', code }),
      /not valid or has expired/,
    );
  });

  it('rejects a code once it has expired', async () => {
    const rows = fakeOtpTable();
    const { code } = await issueOtp({ email: EMAIL, purpose: 'EMAIL_VERIFICATION' });

    ageRows(rows, env.OTP_TTL_MINUTES * 60 + 1);

    await assert.rejects(
      consumeOtp({ email: EMAIL, purpose: 'EMAIL_VERIFICATION', code }),
      /not valid or has expired/,
    );
  });

  it('invalidates the previous code when a new one is issued', async () => {
    const rows = fakeOtpTable();
    const first = await issueOtp({ email: EMAIL, purpose: 'EMAIL_VERIFICATION' });

    ageRows(rows, 61); // past the resend cooldown
    const second = await issueOtp({ email: EMAIL, purpose: 'EMAIL_VERIFICATION' });

    await assert.rejects(
      consumeOtp({ email: EMAIL, purpose: 'EMAIL_VERIFICATION', code: first.code }),
      /not valid or has expired/,
    );
    assert.equal(
      await consumeOtp({ email: EMAIL, purpose: 'EMAIL_VERIFICATION', code: second.code }),
      true,
    );
  });

  it('refuses to resend within the cooldown, so the endpoint cannot spam an inbox', async () => {
    fakeOtpTable();
    await issueOtp({ email: EMAIL, purpose: 'EMAIL_VERIFICATION' });

    await assert.rejects(issueOtp({ email: EMAIL, purpose: 'EMAIL_VERIFICATION' }), (error) => {
      assert.equal(error.statusCode, 429);
      return true;
    });
  });

  it('binds a code to its purpose', async () => {
    fakeOtpTable();
    const { code } = await issueOtp({ email: EMAIL, purpose: 'EMAIL_VERIFICATION' });

    await assert.rejects(
      consumeOtp({ email: EMAIL, purpose: 'PASSWORD_RESET', code }),
      /not valid or has expired/,
    );
  });

  it('binds a code to its address', async () => {
    fakeOtpTable();
    const { code } = await issueOtp({ email: EMAIL, purpose: 'PASSWORD_RESET' });

    await assert.rejects(
      consumeOtp({ email: 'someone.else@example.com', purpose: 'PASSWORD_RESET', code }),
      /not valid or has expired/,
    );
  });
});

describe('sign-in requires a verified address', () => {
  const PASSWORD = 'a-good-long-password';

  async function stubUser(overrides) {
    prisma.user = {
      findUnique: async () => ({
        id: 'usr_1',
        email: EMAIL,
        status: 'ACTIVE',
        passwordHash: await hashPassword(PASSWORD),
        emailVerifiedAt: null,
        ...overrides,
      }),
    };
  }

  it('refuses an unverified account with EMAIL_UNVERIFIED, so the UI can offer a code', async () => {
    await stubUser({});

    await assert.rejects(authenticateUser({ email: EMAIL, password: PASSWORD }), (error) => {
      assert.equal(error.statusCode, 403);
      assert.equal(error.code, 'EMAIL_UNVERIFIED');
      return true;
    });
  });

  it('checks the password first, so the gate cannot be used to find registered addresses', async () => {
    await stubUser({});

    await assert.rejects(authenticateUser({ email: EMAIL, password: 'wrong-password' }), (error) => {
      assert.equal(error.statusCode, 401);
      assert.notEqual(error.code, 'EMAIL_UNVERIFIED');
      return true;
    });
  });

  it('lets a verified account through', async () => {
    await stubUser({ emailVerifiedAt: new Date() });

    const user = await authenticateUser({ email: EMAIL, password: PASSWORD });
    assert.equal(user.email, EMAIL);
  });
});
