import 'server-only';
import { cookies } from 'next/headers';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  CSRF_COOKIE,
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
  csrfCookieOptions,
  expiredCookieOptions,
  parseExpiresInToSeconds,
} from '@/lib/server/session-cookies';

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: string;
}

export async function setSessionCookies(tokens: IssuedTokens): Promise<void> {
  const store = await cookies();
  store.set(
    ACCESS_TOKEN_COOKIE,
    tokens.accessToken,
    accessTokenCookieOptions(parseExpiresInToSeconds(tokens.accessTokenExpiresIn)),
  );
  store.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, refreshTokenCookieOptions());
}

export async function clearSessionCookies(): Promise<void> {
  const store = await cookies();
  store.set(ACCESS_TOKEN_COOKIE, '', expiredCookieOptions('/'));
  store.set(REFRESH_TOKEN_COOKIE, '', expiredCookieOptions('/api/auth'));
}

export async function getAccessToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(ACCESS_TOKEN_COOKIE)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(REFRESH_TOKEN_COOKIE)?.value;
}

export async function ensureCsrfCookie(): Promise<string> {
  const store = await cookies();
  const existing = store.get(CSRF_COOKIE)?.value;
  if (existing) return existing;
  const value = crypto.randomUUID();
  store.set(CSRF_COOKIE, value, csrfCookieOptions());
  return value;
}
