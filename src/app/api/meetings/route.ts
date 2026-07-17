import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { callBackend } from '@/lib/server/backend-client';
import { getAccessToken } from '@/lib/server/session-response';
import { toErrorResponse } from '@/lib/server/api-error';

const schema = z.object({
  scheduledAt: z.string(),
  modificationId: z.string().uuid().optional(),
  notes: z.string().max(1000).optional(),
});

export async function GET(): Promise<NextResponse> {
  try {
    const accessToken = await getAccessToken();
    const data = await callBackend('/meetings/me', { accessToken });
    return NextResponse.json(data);
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return NextResponse.json(
        { statusCode: 401, error: 'Unauthorized', message: 'Please sign in to book a meeting.' },
        { status: 401 },
      );
    }
    const body = schema.parse(await request.json().catch(() => ({})));
    const data = await callBackend('/meetings', { method: 'POST', body, accessToken });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
