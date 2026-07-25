import { NextRequest, NextResponse } from 'next/server';
import { callBackend } from '@/lib/server/backend-client';
import { getAccessToken, getRefreshToken, setSessionCookies, IssuedTokens } from '@/lib/server/session-response';
import { toErrorResponse } from '@/lib/server/api-error';
import { SafeUser } from '@/lib/types/user';

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const accessToken = await getAccessToken();
    const body = await request.json().catch(() => ({}));
    const user = await callBackend<SafeUser>('/auth/me/email', { method: 'PATCH', body, accessToken });

    // The just-updated email isn't reflected in the current access token's
    // claims until it's reissued — refresh immediately so the session is
    // never left showing the old address.
    const refreshToken = await getRefreshToken();
    if (refreshToken) {
      const tokens = await callBackend<IssuedTokens>('/auth/refresh', {
        method: 'POST',
        body: { refreshToken },
      });
      await setSessionCookies(tokens);
    }

    return NextResponse.json({ user });
  } catch (err) {
    return toErrorResponse(err);
  }
}
