import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';

export const ApiAuthController = () =>
  applyDecorators(ApiTags('auth'));

export const ApiRegister = () =>
  applyDecorators(
    ApiOperation({ summary: 'Register with email and password' }),
    ApiBody({ type: RegisterDto }),
    ApiOkResponse({
      description: 'Returns access and refresh tokens for the new user.',
    }),
    ApiConflictResponse({ description: 'Email already registered.' }),
  );

export const ApiLogin = () =>
  applyDecorators(
    ApiOperation({ summary: 'Login with email and password' }),
    ApiBody({ type: LoginDto }),
    ApiOkResponse({ description: 'Returns access and refresh tokens.' }),
    ApiUnauthorizedResponse({ description: 'Invalid credentials.' }),
  );

export const ApiGoogleLogin = () =>
  applyDecorators(
    ApiOperation({ summary: 'Login or sign in with Google ID token' }),
    ApiBody({ type: GoogleLoginDto }),
    ApiOkResponse({ description: 'Returns access and refresh tokens.' }),
    ApiUnauthorizedResponse({ description: 'Invalid Google identity.' }),
  );

export const ApiRefresh = () =>
  applyDecorators(
    ApiOperation({ summary: 'Rotate refresh token and issue new tokens' }),
    ApiBody({ type: RefreshTokenDto }),
    ApiOkResponse({ description: 'Returns a new access/refresh token pair.' }),
    ApiUnauthorizedResponse({ description: 'Invalid refresh token.' }),
  );

export const ApiLogout = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Revoke a refresh token' }),
    ApiBody({ type: RefreshTokenDto }),
    ApiOkResponse({ description: 'Refresh token revoked.' }),
  );
