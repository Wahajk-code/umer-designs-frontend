import { NextResponse } from 'next/server';
import { callBackend } from '@/lib/server/backend-client';
import { getAccessToken } from '@/lib/server/session-response';
import { toErrorResponse } from '@/lib/server/api-error';

export async function PATCH(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { id } = await ctx.params;
    const accessToken = await getAccessToken();
    const data = await callBackend(`/admin/meetings/${id}/cancel`, { method: 'PATCH', accessToken });
    return NextResponse.json(data);
  } catch (err) {
    return toErrorResponse(err);
  }
}
