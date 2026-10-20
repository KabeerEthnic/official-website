import { diff, record } from '../../services/audit.service.js';
import { getCurtain, updateCurtain } from '../../services/site.service.js';
import { parse } from '../../validators/common.js';
import { updateCurtainSchema } from '../../validators/site.validator.js';
import { serializeCurtain } from '../site.controller.js';

export async function getAdminCurtain(request, reply) {
  const curtain = await getCurtain({ fresh: true });
  return reply.send({ data: serializeCurtain(curtain, { admin: true }) });
}

export async function patchCurtain(request, reply) {
  const input = parse(updateCurtainSchema, request.body);
  const { before, curtain } = await updateCurtain({ ...input, actorEmail: request.user.email });

  const toggled = input.enabled !== undefined && input.enabled !== before.enabled;

  await record(request, {
    action: toggled ? (curtain.enabled ? 'site.curtain_dropped' : 'site.curtain_lifted') : 'site.curtain_edited',
    entityType: 'SiteCurtain',
    entityId: curtain.id,
    summary: toggled
      ? curtain.enabled
        ? 'Dropped the curtain — the storefront is closed to shoppers'
        : 'Lifted the curtain — the storefront is open again'
      : 'Edited the curtain wording',
    metadata: diff(before, curtain, ['enabled', 'title', 'message']),
  });

  return reply.send({ data: serializeCurtain(curtain, { admin: true }) });
}
