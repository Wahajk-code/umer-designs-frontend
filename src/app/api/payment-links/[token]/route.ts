import { NextResponse } from 'next/server';
import { callBackend } from '@/lib/server/backend-client';
import { toErrorResponse } from '@/lib/server/api-error';

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ token: string }> },
): Promise<NextResponse> {
  try {
    const { token } = await ctx.params;
    const data = await callBackend(`/payment-links/${encodeURIComponent(token)}`);
    return NextResponse.json(data);
  } catch (err) {
    return toErrorResponse(err);
  }
}
