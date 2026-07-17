import 'server-only';

export const ACCESS_TOKEN_COOKIE = 'ud_at';
export const REFRESH_TOKEN_COOKIE = 'ud_rt';
export const CSRF_COOKIE = 'ud_csrf';

const REFRESH_TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
const CSRF_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax' | 'strict' | 'none';
  path: string;
  maxAge: number;
}

const isProd = process.env.NODE_ENV === 'production';

/** Parses Nest's JWT `expiresIn` strings ("15m", "1h") into seconds for the cookie Max-Age. */
export function parseExpiresInToSeconds(expiresIn: string): number {
  const match = /^(\d+)([smhd])$/.exec(expiresIn);
  if (!match) return 15 * 60;
  const value = Number(match[1]);
  const unit = match[2];
  const multiplier = { s: 1, m: 60, h: 3600, d: 86400 }[unit] ?? 60;
  return value * multiplier;
}

export function accessTokenCookieOptions(maxAgeSeconds: number): CookieOptions {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeSeconds,
  };
}

/** Scoped to /api/auth only — the refresh token never needs to leave that path. */
export function refreshTokenCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
  };
}

/** Deliberately NOT httpOnly — the client reads this and echoes it back as a header (double-submit CSRF). */
export function csrfCookieOptions(): CookieOptions {
  return {
    httpOnly: false,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: CSRF_MAX_AGE_SECONDS,
  };
}

export function expiredCookieOptions(path = '/'): CookieOptions {
  return { httpOnly: true, secure: isProd, sameSite: 'lax', path, maxAge: 0 };
}
