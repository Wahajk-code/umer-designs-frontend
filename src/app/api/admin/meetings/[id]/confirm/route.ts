import { NextRequest, NextResponse } from 'next/server';
import { callBackend } from '@/lib/server/backend-client';
import { getAccessToken } from '@/lib/server/session-response';
import { toErrorResponse } from '@/lib/server/api-error';

export async function PATCH(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { id } = await ctx.params;
    const accessToken = await getAccessToken();
    const body = await request.json().catch(() => ({}));
    const data = await callBackend(`/admin/meetings/${id}/confirm`, {
      method: 'PATCH',
      body,
      accessToken,
    });
    return NextResponse.json(data);
  } catch (err) {
    return toErrorResponse(err);
  }
}
