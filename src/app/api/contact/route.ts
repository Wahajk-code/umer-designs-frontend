import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { callBackend } from '@/lib/server/backend-client';
import { toErrorResponse } from '@/lib/server/api-error';

const schema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  message: z.string().min(1).max(3000),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = schema.parse(await request.json().catch(() => ({})));
    await callBackend('/contact', { method: 'POST', body });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
