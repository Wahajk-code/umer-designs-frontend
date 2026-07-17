import { NextRequest, NextResponse } from 'next/server';
import { callBackend } from '@/lib/server/backend-client';
import { getAccessToken } from '@/lib/server/session-response';
import { toErrorResponse } from '@/lib/server/api-error';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const accessToken = await getAccessToken();
    const qs = request.nextUrl.search;
    const data = await callBackend(`/admin/payment-links${qs}`, { accessToken });
    return NextResponse.json(data);
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const accessToken = await getAccessToken();
    const body = await request.json().catch(() => ({}));
    const data = await callBackend('/admin/payment-links', { method: 'POST', body, accessToken });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
