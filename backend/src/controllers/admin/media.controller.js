import env from '../../config/env.js';
import { badRequest } from '../../lib/errors.js';
import { assertStorageConfigured, deleteImage, uploadImage } from '../../lib/storage.js';

const FOLDERS = new Set(['products', 'categories', 'content']);

/**
 * Accepts one image per request, checks it by content rather than by filename,
 * and stores it in Supabase Storage. PostgreSQL only ever sees the URL.
 */
export async function postUpload(request, reply) {
  assertStorageConfigured();

  const file = await request.file({ limits: { fileSize: env.MAX_UPLOAD_BYTES, files: 1 } });
  if (!file) throw badRequest('Attach an image to upload');

  const buffer = await file.toBuffer();

  // Fastify-multipart flags a stream that hit the size limit rather than
  // throwing, so the check has to happen after the body is read.
  if (file.file.truncated) {
    throw badRequest(`File exceeds the ${Math.floor(env.MAX_UPLOAD_BYTES / 1024 / 1024)}MB limit`);
  }

  const requested = file.fields?.folder?.value;
  const folder = FOLDERS.has(requested) ? requested : 'products';

  const uploaded = await uploadImage({ buffer, mimetype: file.mimetype, folder });

  return reply.code(201).send({ data: uploaded });
}

export async function deleteUpload(request, reply) {
  const path = String(request.query?.path ?? '').trim();
  if (!path) throw badRequest('Provide the storage path to delete');

  const removed = await deleteImage(path);

  return reply.send({ data: { success: removed } });
}
