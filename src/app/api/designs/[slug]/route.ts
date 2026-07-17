import { NextResponse } from 'next/server';
import { callBackend } from '@/lib/server/backend-client';
import { toErrorResponse } from '@/lib/server/api-error';

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  try {
    const { slug } = await ctx.params;
    const data = await callBackend(`/designs/${encodeURIComponent(slug)}`);
    return NextResponse.json(data);
  } catch (err) {
    return toErrorResponse(err);
  }
}
