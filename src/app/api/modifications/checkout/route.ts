import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { callBackend } from '@/lib/server/backend-client';
import { getAccessToken } from '@/lib/server/session-response';
import { toErrorResponse } from '@/lib/server/api-error';

const schema = z.object({
  designId: z.string().uuid(),
  selectedOptionIds: z.array(z.string().uuid()).min(1),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return NextResponse.json(
        { statusCode: 401, error: 'Unauthorized', message: 'Please sign in to continue.' },
        { status: 401 },
      );
    }
    const json = await request.json().catch(() => ({}));
    const body = schema.parse(json);
    const data = await callBackend('/modifications/checkout', { method: 'POST', body, accessToken });
    return NextResponse.json(data);
  } catch (err) {
    return toErrorResponse(err);
  }
}
