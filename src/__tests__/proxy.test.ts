/** @jest-environment node */
import { NextRequest } from 'next/server';
import { proxy } from '@/proxy';

function makeRequest(
  url: string,
  init: { method?: string; headers?: Record<string, string>; cookie?: string } = {},
): NextRequest {
  const headers = new Headers(init.headers ?? {});
  if (init.cookie) headers.set('cookie', init.cookie);
  return new NextRequest(new URL(url, 'http://localhost:3000'), {
    method: init.method ?? 'GET',
    headers,
  });
}

describe('proxy', () => {
  it('sets a csrf cookie on a fresh request with none yet', () => {
    const res = proxy(makeRequest('/'));
    expect(res.cookies.get('ud_csrf')).toBeDefined();
  });

  it('does not overwrite an existing csrf cookie', () => {
    const res = proxy(makeRequest('/', { cookie: 'ud_csrf=existing-value' }));
    expect(res.cookies.get('ud_csrf')).toBeUndefined();
  });

  it('rejects a mutating /api request with no csrf header', () => {
    const res = proxy(
      makeRequest('/api/auth/logout', { method: 'POST', cookie: 'ud_csrf=abc123' }),
    );
    expect(res.status).toBe(403);
  });

  it('rejects a mutating /api request whose csrf header does not match the cookie', () => {
    const res = proxy(
      makeRequest('/api/auth/logout', {
        method: 'POST',
        cookie: 'ud_csrf=abc123',
        headers: { 'x-csrf-token': 'wrong-value' },
      }),
    );
    expect(res.status).toBe(403);
  });

  it('allows a mutating /api request whose csrf header matches the cookie', () => {
    const res = proxy(
      makeRequest('/api/auth/logout', {
        method: 'POST',
        cookie: 'ud_csrf=abc123',
        headers: { 'x-csrf-token': 'abc123' },
      }),
    );
    expect(res.status).not.toBe(403);
  });

  it('exempts the stripe webhook path from csrf enforcement', () => {
    const res = proxy(makeRequest('/api/webhooks/stripe', { method: 'POST', cookie: 'ud_csrf=abc123' }));
    expect(res.status).not.toBe(403);
  });

  it('redirects to sign-in for a protected dashboard route with no session cookie', () => {
    const res = proxy(makeRequest('/dashboard'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/sign-in');
  });

  it('allows a protected dashboard route through when a session cookie is present', () => {
    const res = proxy(makeRequest('/dashboard', { cookie: 'ud_at=some-access-token' }));
    expect(res.status).not.toBe(307);
  });
});
