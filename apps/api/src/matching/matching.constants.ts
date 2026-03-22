export const WALMART_USE_REAL_PROVIDER =
  process.env.WALMART_USE_REAL_PROVIDER === 'true';

export const WALMART_CLIENT_ID = process.env.WALMART_CLIENT_ID;
export const WALMART_CLIENT_SECRET = process.env.WALMART_CLIENT_SECRET;
export const WALMART_ENV = process.env.WALMART_ENV ?? 'sandbox';

export const WALMART_API_BASE_URL =
  WALMART_ENV === 'production'
    ? 'https://marketplace.walmartapis.com'
    : 'https://sandbox.walmartapis.com';

export const KROGER_USE_REAL_PROVIDER =
  process.env.KROGER_USE_REAL_PROVIDER !== 'false';

export const KROGER_CLIENT_ID = process.env.KROGER_CLIENT_ID;
export const KROGER_CLIENT_SECRET = process.env.KROGER_CLIENT_SECRET;
export const KROGER_API_BASE_URL = 'https://api.kroger.com/v1/';
export const KROGER_TOKEN_URL = `${KROGER_API_BASE_URL}connect/oauth2/token`;
