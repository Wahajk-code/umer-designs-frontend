import { NextResponse } from 'next/server';
import { callBackend } from '@/lib/server/backend-client';
import { getAccessToken } from '@/lib/server/session-response';
import { toErrorResponse } from '@/lib/server/api-error';

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ id: string; fileId: string }> },
): Promise<NextResponse> {
  try {
    const { id, fileId } = await ctx.params;
    const accessToken = await getAccessToken();
    const data = await callBackend(`/orders/${id}/download/${fileId}`, { accessToken });
    return NextResponse.json(data);
  } catch (err) {
    return toErrorResponse(err);
  }
}
