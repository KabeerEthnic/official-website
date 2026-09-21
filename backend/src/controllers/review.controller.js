import { serializeReview } from '../lib/serialize.js';
import { createReview, deleteReview, updateOwnReview } from '../services/review.service.js';
import { createReviewSchema, updateReviewSchema } from '../validators/commerce.validator.js';
import { parse } from '../validators/common.js';

export async function postReview(request, reply) {
  const input = parse(createReviewSchema, request.body);
  const review = await createReview({ userId: request.user.id, ...input });

  return reply.code(201).send({
    data: serializeReview(review),
    meta: { message: 'Thanks! Your review will appear once it has been checked.' },
  });
}

export async function putReview(request, reply) {
  const input = parse(updateReviewSchema, request.body);
  const review = await updateOwnReview({
    reviewId: request.params.id,
    userId: request.user.id,
    ...input,
  });

  return reply.send({ data: serializeReview(review) });
}

export async function removeReview(request, reply) {
  await deleteReview({ reviewId: request.params.id, actor: request.user });
  return reply.send({ data: { success: true } });
}
