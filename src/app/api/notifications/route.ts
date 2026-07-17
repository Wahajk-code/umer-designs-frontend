import { NextRequest, NextResponse } from 'next/server';
import { callBackend } from '@/lib/server/backend-client';
import { getAccessToken } from '@/lib/server/session-response';
import { toErrorResponse } from '@/lib/server/api-error';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const accessToken = await getAccessToken();
    const qs = request.nextUrl.search;
    const data = await callBackend(`/notifications/me${qs}`, { accessToken });
    return NextResponse.json(data);
  } catch (err) {
    return toErrorResponse(err);
  }
}
