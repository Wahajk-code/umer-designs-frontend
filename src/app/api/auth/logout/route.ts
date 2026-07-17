import { NextResponse } from 'next/server';
import { callBackend } from '@/lib/server/backend-client';
import { getRefreshToken, clearSessionCookies } from '@/lib/server/session-response';
import { toErrorResponse } from '@/lib/server/api-error';

export async function POST(): Promise<NextResponse> {
  try {
    const refreshToken = await getRefreshToken();
    if (refreshToken) {
      // Best-effort revoke server-side; cookies are cleared regardless.
      await callBackend('/auth/logout', { method: 'POST', body: { refreshToken } }).catch(() => undefined);
    }
    await clearSessionCookies();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
