import { NextRequest, NextResponse } from 'next/server';

const ACCESS_TOKEN_COOKIE = 'ud_at';
const CSRF_COOKIE = 'ud_csrf';
const CSRF_HEADER = 'x-csrf-token';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

// Called by Stripe, not the browser — authenticated by webhook signature instead of CSRF.
const CSRF_EXEMPT_PATHS = ['/api/webhooks/stripe'];

const PROTECTED_PREFIXES = ['/dashboard', '/admin'];

/**
 * Optimistic checks only (per Next's guidance): CSRF double-submit + a
 * redirect-if-no-session-cookie nicety. The real authorization boundary is
 * always the Nest backend, which re-validates the JWT and role on every
 * request regardless of what happens here.
 */
export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  const existingCsrf = request.cookies.get(CSRF_COOKIE)?.value;
  const csrfToken = existingCsrf ?? crypto.randomUUID();
  if (!existingCsrf) {
    response.cookies.set(CSRF_COOKIE, csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });
  }

  if (
    pathname.startsWith('/api/') &&
    MUTATING_METHODS.has(request.method) &&
    !CSRF_EXEMPT_PATHS.some((exempt) => pathname === exempt)
  ) {
    const headerToken = request.headers.get(CSRF_HEADER);
    if (!existingCsrf || !headerToken || headerToken !== existingCsrf) {
      return NextResponse.json(
        { statusCode: 403, error: 'Forbidden', message: 'Invalid or missing CSRF token.' },
        { status: 403 },
      );
    }
  }

  if (PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    const hasSession = Boolean(request.cookies.get(ACCESS_TOKEN_COOKIE)?.value);
    if (!hasSession) {
      const signInUrl = new URL('/sign-in', request.url);
      signInUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|gif|ico)$).*)'],
};
