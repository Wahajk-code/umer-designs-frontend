import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { callBackend } from '@/lib/server/backend-client';
import { getAccessToken } from '@/lib/server/session-response';
import { toErrorResponse } from '@/lib/server/api-error';

const schema = z.object({ comment: z.string().min(1).max(2000) });

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { id } = await ctx.params;
    const accessToken = await getAccessToken();
    const body = schema.parse(await request.json().catch(() => ({})));
    const data = await callBackend(`/modifications/${id}/comments`, {
      method: 'POST',
      body,
      accessToken,
    });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
