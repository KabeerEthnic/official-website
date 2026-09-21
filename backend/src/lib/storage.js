import { randomUUID } from 'node:crypto';

import env from '../config/env.js';
import { badRequest, serviceUnavailable } from './errors.js';

/**
 * Supabase Storage over its REST API. Binaries never touch PostgreSQL — only
 * the public URL and the object path are stored, so files can be deleted later.
 */
const ALLOWED = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/avif', 'avif'],
]);

/**
 * Magic-byte signatures. The declared Content-Type of an upload is attacker
 * controlled, so the real format is confirmed from the bytes themselves.
 */
function sniffMime(buffer) {
  if (buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg';
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return 'image/png';
  }
  if (buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP') {
    return 'image/webp';
  }
  if (buffer.subarray(4, 8).toString('ascii') === 'ftyp') {
    const brand = buffer.subarray(8, 12).toString('ascii');
    if (brand === 'avif' || brand === 'avis') return 'image/avif';
  }
  return null;
}

/** Storage keys are generated, never derived from the client filename. */
function buildPath(folder, extension) {
  const safeFolder = String(folder ?? 'misc').replace(/[^a-z0-9/-]/gi, '-');
  const now = new Date();
  const yyyyMm = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  return `${safeFolder}/${yyyyMm}/${randomUUID()}.${extension}`;
}

export function assertStorageConfigured() {
  if (!env.storageEnabled) {
    throw serviceUnavailable('Media storage is not configured on this server');
  }
}

/**
 * Supabase routes on `apikey` and authorizes on the bearer token. Sending both
 * works for the current secret keys (`sb_secret_…`, opaque) and for the legacy
 * service_role JWTs they replace.
 */
function authHeaders() {
  return {
    apikey: env.supabaseKey,
    Authorization: `Bearer ${env.supabaseKey}`,
  };
}

/**
 * Turns a Supabase Storage failure into something the person in the admin can
 * act on. A missing bucket or a bad key is a setup problem, not a server bug,
 * so it must not surface as "Something went wrong".
 */
function translateStorageError(status, body) {
  const code = (() => {
    try {
      return JSON.parse(body)?.code ?? '';
    } catch {
      return '';
    }
  })();

  if (code === 'NoSuchBucket' || /bucket not found/i.test(body)) {
    return serviceUnavailable(
      `The storage bucket "${env.SUPABASE_STORAGE_BUCKET}" does not exist. ` +
        'Create it in Supabase → Storage (public), or point SUPABASE_STORAGE_BUCKET at an existing bucket.',
    );
  }

  if (status === 401 || status === 403) {
    return serviceUnavailable(
      'Supabase rejected the storage credentials. Check SUPABASE_SECRET_KEY is a secret key (sb_secret_…) for this project.',
    );
  }

  if (status === 413) {
    return badRequest('That file is larger than the storage bucket allows.');
  }

  // Anything else is genuinely unexpected: log the detail, show a safe message.
  const error = new Error(`Storage upload failed (${status}): ${body.slice(0, 200)}`);
  error.expose = false;
  return error;
}

export async function uploadImage({ buffer, mimetype, folder = 'products' }) {
  assertStorageConfigured();

  if (!buffer?.length) throw badRequest('Uploaded file is empty');
  if (buffer.length > env.MAX_UPLOAD_BYTES) {
    throw badRequest(`File exceeds the ${Math.floor(env.MAX_UPLOAD_BYTES / 1024 / 1024)}MB limit`);
  }

  const sniffed = sniffMime(buffer);
  if (!sniffed || !ALLOWED.has(sniffed)) {
    throw badRequest('Only JPEG, PNG, WebP and AVIF images can be uploaded');
  }
  if (mimetype && mimetype !== sniffed) {
    throw badRequest('File content does not match its declared type');
  }

  const path = buildPath(folder, ALLOWED.get(sniffed));
  const endpoint = `${env.SUPABASE_URL}/storage/v1/object/${env.SUPABASE_STORAGE_BUCKET}/${path}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      ...authHeaders(),
      'Content-Type': sniffed,
      'x-upsert': 'false',
      'cache-control': 'public, max-age=31536000, immutable',
    },
    body: buffer,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw translateStorageError(response.status, detail);
  }

  return {
    path,
    url: `${env.SUPABASE_URL}/storage/v1/object/public/${env.SUPABASE_STORAGE_BUCKET}/${path}`,
    mimetype: sniffed,
    size: buffer.length,
  };
}

export async function deleteImage(path) {
  if (!path || !env.storageEnabled) return false;

  const endpoint = `${env.SUPABASE_URL}/storage/v1/object/${env.SUPABASE_STORAGE_BUCKET}/${path}`;
  const response = await fetch(endpoint, { method: 'DELETE', headers: authHeaders() });

  return response.ok;
}
