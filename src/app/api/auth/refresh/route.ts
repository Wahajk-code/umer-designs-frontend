import { NextResponse } from 'next/server';
import { callBackend, BackendError } from '@/lib/server/backend-client';
import {
  getRefreshToken,
  setSessionCookies,
  clearSessionCookies,
  IssuedTokens,
} from '@/lib/server/session-response';
import { toErrorResponse } from '@/lib/server/api-error';

export async function POST(): Promise<NextResponse> {
  try {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      return NextResponse.json(
        { statusCode: 401, error: 'Unauthorized', message: 'No active session.' },
        { status: 401 },
      );
    }

    try {
      const tokens = await callBackend<IssuedTokens>('/auth/refresh', {
        method: 'POST',
        body: { refreshToken },
      });
      await setSessionCookies(tokens);
      return NextResponse.json({ ok: true });
    } catch (err) {
      if (err instanceof BackendError && err.statusCode === 401) {
        // Reuse detected or expired: drop whatever cookies remain so the client re-authenticates cleanly.
        await clearSessionCookies();
      }
      throw err;
    }
  } catch (err) {
    return toErrorResponse(err);
  }
}
