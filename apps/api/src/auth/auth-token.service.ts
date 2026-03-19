import { createHash, randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import type { UserRole } from '../../generated/prisma';
import {
  AUTH_ACCESS_TOKEN_EXPIRES_IN,
  AUTH_JWT_SECRET,
  AUTH_REFRESH_TOKEN_EXPIRES_IN_DAYS,
} from './auth.constants';
import type { AuthenticatedUser, AuthTokens } from './auth.types';

@Injectable()
export class AuthTokenService {
  constructor(private readonly jwtService: JwtService) {}

  async signAccessToken(payload: {
    sub: string;
    email: string;
    role: UserRole;
  }): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: AUTH_JWT_SECRET,
      expiresIn: AUTH_ACCESS_TOKEN_EXPIRES_IN as StringValue,
    });
  }

  async verifyAccessToken(token: string): Promise<AuthenticatedUser> {
    return this.jwtService.verifyAsync<AuthenticatedUser>(token, {
      secret: AUTH_JWT_SECRET,
    });
  }

  async buildAuthTokens(payload: {
    sub: string;
    email: string;
    role: UserRole;
  }): Promise<AuthTokens & { refreshTokenHash: string; refreshTokenExpiresAt: Date }> {
    const accessToken = await this.signAccessToken(payload);
    const refreshToken = randomBytes(48).toString('base64url');
    const refreshTokenHash = this.hashRefreshToken(refreshToken);
    const refreshTokenExpiresAt = new Date(
      Date.now() + AUTH_REFRESH_TOKEN_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000,
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: AUTH_ACCESS_TOKEN_EXPIRES_IN,
      refreshTokenHash,
      refreshTokenExpiresAt,
    };
  }

  hashRefreshToken(refreshToken: string): string {
    return createHash('sha256').update(refreshToken).digest('hex');
  }
}
