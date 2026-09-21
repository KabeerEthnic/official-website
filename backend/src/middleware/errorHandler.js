import { ZodError } from 'zod';

import env from '../config/env.js';
import { AppError } from '../lib/errors.js';

/** Field-level messages the UI can attach to inputs. */
function formatZodIssues(error) {
  return error.issues.map((issue) => ({
    field: issue.path.join('.') || '(root)',
    message: issue.message,
  }));
}

/**
 * The single place an error turns into a response. Clients only ever see a
 * code, a human message and — for validation failures — the offending fields.
 * Stack traces, SQL and file paths stay in the server log.
 */
export function registerErrorHandler(app) {
  app.setNotFoundHandler((request, reply) => {
    reply.code(404).send({
      error: { code: 'NOT_FOUND', message: `Route ${request.method} ${request.url} not found` },
    });
  });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.code(422).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Some of the submitted values are invalid',
          details: formatZodIssues(error),
        },
      });
    }

    if (error instanceof AppError) {
      if (error.statusCode >= 500) request.log.error({ err: error }, 'Application error');
      return reply.code(error.statusCode).send({
        error: { code: error.code, message: error.message, ...(error.details ? { details: error.details } : {}) },
      });
    }

    // Prisma known request errors — translated, never forwarded verbatim.
    if (error.code === 'P2002') {
      const target = Array.isArray(error.meta?.target) ? error.meta.target.join(', ') : 'value';
      return reply.code(409).send({
        error: { code: 'CONFLICT', message: `That ${target} is already in use` },
      });
    }
    if (error.code === 'P2025') {
      return reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'Resource not found' } });
    }
    if (error.code === 'P2003') {
      return reply.code(409).send({
        error: { code: 'CONFLICT', message: 'This record is still referenced by other data' },
      });
    }

    // Fastify-generated client errors (bad JSON, payload too large, rate limit).
    if (error.statusCode && error.statusCode < 500) {
      return reply.code(error.statusCode).send({
        error: { code: error.code ?? 'BAD_REQUEST', message: error.message },
      });
    }

    request.log.error({ err: error }, 'Unhandled error');
    return reply.code(500).send({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Something went wrong. Please try again.',
        ...(env.isProduction ? {} : { debug: error.message }),
      },
    });
  });
}
