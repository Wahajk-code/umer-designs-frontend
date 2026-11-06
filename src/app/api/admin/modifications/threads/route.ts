import { NextResponse } from 'next/server';
import { callBackend } from '@/lib/server/backend-client';
import { getAccessToken } from '@/lib/server/session-response';
import { toErrorResponse } from '@/lib/server/api-error';

export async function GET(): Promise<NextResponse> {
  try {
    const accessToken = await getAccessToken();
    return NextResponse.json(await callBackend('/admin/modifications/threads', { accessToken }));
  } catch (err) {
    return toErrorResponse(err);
  }
}
