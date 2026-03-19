import { OAuth2Client } from 'google-auth-library';
import {
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { GOOGLE_CLIENT_ID } from './auth.constants';
import type { GoogleIdentityPayload } from './auth.types';

@Injectable()
export class GoogleTokenVerifierService {
  private readonly oauthClient = new OAuth2Client(GOOGLE_CLIENT_ID);

  async verify(idToken: string): Promise<GoogleIdentityPayload> {
    if (!GOOGLE_CLIENT_ID) {
      throw new ServiceUnavailableException(
        'Google authentication is not configured',
      );
    }

    const ticket = await this.oauthClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload?.sub || !payload.email) {
      throw new UnauthorizedException('Invalid Google identity');
    }

    return {
      subject: payload.sub,
      email: payload.email,
      email_verified: Boolean(payload.email_verified),
      name: payload.name ?? undefined,
    };
  }
}
