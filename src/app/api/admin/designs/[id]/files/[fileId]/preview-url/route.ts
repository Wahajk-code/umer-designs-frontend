import { NextRequest, NextResponse } from 'next/server';
import { callBackend } from '@/lib/server/backend-client';
import { getAccessToken } from '@/lib/server/session-response';
import { toErrorResponse } from '@/lib/server/api-error';

export async function GET(
  _request: NextRequest,
  ctx: { params: Promise<{ id: string; fileId: string }> },
): Promise<NextResponse> {
  try {
    const { id, fileId } = await ctx.params;
    const accessToken = await getAccessToken();
    const data = await callBackend(`/admin/designs/${id}/files/${fileId}/preview-url`, {
      accessToken,
    });
    return NextResponse.json(data);
  } catch (err) {
    return toErrorResponse(err);
  }
}
