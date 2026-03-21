import type { Tag } from '@cart/shared';
import type { Tag as PrismaTag } from '../../generated/prisma';

export const mapTag = (tag: PrismaTag): Tag => ({
  id: tag.id,
  owner_user_id: tag.ownerUserId ?? undefined,
  name: tag.name,
  slug: tag.slug,
  scope: tag.scope,
  kind: tag.kind,
  created_at: tag.createdAt.toISOString(),
  updated_at: tag.updatedAt.toISOString(),
});
