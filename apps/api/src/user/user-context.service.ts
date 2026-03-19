import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DEFAULT_DEV_USER_EMAIL } from './user-context.constants';

@Injectable()
export class UserContextService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveActorUser(actorUserId?: string): Promise<{ id: string }> {
    if (actorUserId) {
      const actor = await this.prisma.user.findUnique({
        where: { id: actorUserId },
        select: { id: true },
      });

      if (!actor) {
        throw new NotFoundException(`User ${actorUserId} not found`);
      }

      return actor;
    }

    const defaultActor = await this.prisma.user.findUnique({
      where: { email: DEFAULT_DEV_USER_EMAIL },
      select: { id: true },
    });

    if (!defaultActor) {
      throw new NotFoundException(
        `Default dev user ${DEFAULT_DEV_USER_EMAIL} not found`,
      );
    }

    return defaultActor;
  }
}
