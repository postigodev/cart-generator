export const AUTH_ACCESS_TOKEN_EXPIRES_IN =
  process.env.AUTH_ACCESS_TOKEN_EXPIRES_IN ?? '15m';

export const AUTH_JWT_SECRET =
  process.env.AUTH_JWT_SECRET ?? 'cart-generator-dev-access-secret';

export const AUTH_REFRESH_TOKEN_EXPIRES_IN_DAYS = Number.parseInt(
  process.env.AUTH_REFRESH_TOKEN_EXPIRES_IN_DAYS ?? '30',
  10,
);

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
