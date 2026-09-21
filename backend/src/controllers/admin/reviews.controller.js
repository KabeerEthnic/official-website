import { serializeReview } from '../../lib/serialize.js';
import { deleteReview, listReviewsForAdmin, moderateReview } from '../../services/review.service.js';
import { adminReviewQuerySchema, moderateReviewSchema } from '../../validators/commerce.validator.js';
import { parse } from '../../validators/common.js';

export async function listAdminReviews(request, reply) {
  const filters = parse(adminReviewQuerySchema, request.query);
  const { items, pagination } = await listReviewsForAdmin(filters);

  return reply.send({
    data: items.map((review) => serializeReview(review, { admin: true })),
    meta: { pagination },
  });
}

export async function patchReviewStatus(request, reply) {
  const { status } = parse(moderateReviewSchema, request.body);
  const review = await moderateReview({ reviewId: request.params.id, status });

  return reply.send({ data: serializeReview(review, { admin: true }) });
}

export async function deleteAdminReview(request, reply) {
  await deleteReview({ reviewId: request.params.id, actor: request.user });
  return reply.send({ data: { success: true } });
}
