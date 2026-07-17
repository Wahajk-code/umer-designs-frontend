import { NextResponse } from 'next/server';
import { callBackend } from '@/lib/server/backend-client';
import { getAccessToken } from '@/lib/server/session-response';
import { toErrorResponse } from '@/lib/server/api-error';

export async function PATCH(): Promise<NextResponse> {
  try {
    const accessToken = await getAccessToken();
    await callBackend('/notifications/read-all', { method: 'PATCH', accessToken });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
