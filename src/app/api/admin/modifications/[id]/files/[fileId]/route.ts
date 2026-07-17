import { NextResponse } from 'next/server';
import { callBackend } from '@/lib/server/backend-client';
import { getAccessToken } from '@/lib/server/session-response';
import { toErrorResponse } from '@/lib/server/api-error';

export async function DELETE(
  _request: Request,
  ctx: { params: Promise<{ id: string; fileId: string }> },
): Promise<NextResponse> {
  try {
    const { id, fileId } = await ctx.params;
    const accessToken = await getAccessToken();
    await callBackend(`/admin/modifications/${id}/files/${fileId}`, { method: 'DELETE', accessToken });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
