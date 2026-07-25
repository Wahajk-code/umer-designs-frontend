import 'server-only';
import { cache } from 'react';
import { getAccessToken } from '@/lib/server/session-response';
import { callBackend, BackendError } from '@/lib/server/backend-client';
import { SafeUser } from '@/lib/types/user';

/**
 * Server Component / Route Handler DAL entry point — memoized per request via
 * React's cache(). This is the "secure" authorization check (hits the
 * backend, which re-validates the JWT), as opposed to proxy.ts's optimistic
 * cookie-presence check.
 */
export const getCurrentUser = cache(async (): Promise<SafeUser | null> => {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;

  try {
    return await callBackend<SafeUser>('/users/me', { accessToken });
  } catch (err) {
    // Any backend error (invalid token, backend unreachable, etc.) means we
    // can't confirm the session — treat as signed-out rather than crashing
    // the page. A page that works fine anonymously should never fail purely
    // because auth couldn't be verified.
    if (err instanceof BackendError) {
      return null;
    }
    throw err;
  }
});
