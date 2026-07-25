import { NextRequest, NextResponse } from 'next/server';
import { callBackend } from '@/lib/server/backend-client';
import { getAccessToken, clearSessionCookies } from '@/lib/server/session-response';
import { toErrorResponse } from '@/lib/server/api-error';

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const accessToken = await getAccessToken();
    const body = await request.json().catch(() => ({}));
    await callBackend('/auth/me/password', { method: 'PATCH', body, accessToken });

    // The backend just revoked every session for this account, including the
    // current one — clear our cookies to match, rather than holding onto
    // tokens that no longer work.
    await clearSessionCookies();
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
