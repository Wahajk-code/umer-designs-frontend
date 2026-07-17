import { NextResponse } from 'next/server';
import { callBackend } from '@/lib/server/backend-client';
import { getAccessToken } from '@/lib/server/session-response';
import { toErrorResponse } from '@/lib/server/api-error';
import { SafeUser } from '@/lib/types/user';

export async function GET(): Promise<NextResponse> {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return NextResponse.json({ user: null });
    }
    const user = await callBackend<SafeUser>('/users/me', { accessToken });
    return NextResponse.json({ user });
  } catch (err) {
    return toErrorResponse(err);
  }
}
