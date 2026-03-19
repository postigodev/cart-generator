import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import type { UserRole } from '../../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import { DEV_USER_ID_HEADER } from '../common/http/api-headers.swagger';
import { RequestContextService } from '../common/http/request-context.service';
import { AuthTokenService } from './auth-token.service';
import type { AuthenticatedUser } from './auth.types';

type RequestWithUser = Request & {
  user?: AuthenticatedUser;
};

type ActorRecord = {
  id: string;
  email: string;
  role: UserRole;
};

@Injectable()
export class ActorResolverService {
  constructor(
    private readonly authTokenService: AuthTokenService,
    private readonly prisma: PrismaService,
    private readonly requestContextService: RequestContextService,
  ) {}

  async resolveRequestActor(
    request: RequestWithUser,
  ): Promise<AuthenticatedUser | null> {
    const authorization = request.header('authorization');

    if (authorization?.startsWith('Bearer ')) {
      const token = authorization.slice('Bearer '.length).trim();

      if (!token) {
        throw new UnauthorizedException('Authentication required');
      }

      const actor = await this.authTokenService.verifyAccessToken(token);
      this.attachActor(request, actor);
      return actor;
    }

    const devActorIdentifier = request.header(DEV_USER_ID_HEADER)?.trim();

    if (!devActorIdentifier) {
      return null;
    }

    const actor = await this.findActorByIdentifier(devActorIdentifier);

    if (!actor) {
      throw new UnauthorizedException('Authentication required');
    }

    const authenticatedActor: AuthenticatedUser = {
      sub: actor.id,
      email: actor.email,
      role: actor.role,
    };

    this.attachActor(request, authenticatedActor);
    return authenticatedActor;
  }

  private attachActor(request: RequestWithUser, actor: AuthenticatedUser) {
    request.user = actor;
    this.requestContextService.setActorUserId(actor.sub);
  }

  private findActorByIdentifier(actorIdentifier: string) {
    const normalizedIdentifier = actorIdentifier.trim().toLowerCase();
    const where = normalizedIdentifier.includes('@')
      ? { email: normalizedIdentifier }
      : { id: normalizedIdentifier };

    return this.prisma.user.findUnique({
      where,
      select: {
        id: true,
        email: true,
        role: true,
      },
    }) as Promise<ActorRecord | null>;
  }
}

@Injectable()
export class RequestActorGuard implements CanActivate {
  constructor(private readonly actorResolverService: ActorResolverService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const actor = await this.actorResolverService.resolveRequestActor(request);

    if (!actor) {
      throw new UnauthorizedException('Authentication required');
    }

    return true;
  }
}

@Injectable()
export class OptionalRequestActorGuard implements CanActivate {
  constructor(private readonly actorResolverService: ActorResolverService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    await this.actorResolverService.resolveRequestActor(request);
    return true;
  }
}
