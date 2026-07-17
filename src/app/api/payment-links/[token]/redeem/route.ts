import { NextResponse } from 'next/server';
import { callBackend } from '@/lib/server/backend-client';
import { toErrorResponse } from '@/lib/server/api-error';

export async function POST(
  _request: Request,
  ctx: { params: Promise<{ token: string }> },
): Promise<NextResponse> {
  try {
    const { token } = await ctx.params;
    const data = await callBackend(`/payment-links/${encodeURIComponent(token)}/redeem`, {
      method: 'POST',
    });
    return NextResponse.json(data);
  } catch (err) {
    return toErrorResponse(err);
  }
}
