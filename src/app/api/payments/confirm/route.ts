import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { callBackend } from '@/lib/server/backend-client';
import { toErrorResponse } from '@/lib/server/api-error';

const schema = z.object({ sessionId: z.string().regex(/^cs_test_[A-Za-z0-9]+$/) });

/**
 * Local-dev stand-in for the Stripe webhook (the backend 404s unless
 * STRIPE_LOCAL_CONFIRM is enabled in test mode). Safe to call in production:
 * it simply fails and the real webhook does the work.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = schema.parse(await request.json().catch(() => ({})));
    const data = await callBackend('/payments/confirm', { method: 'POST', body });
    return NextResponse.json(data);
  } catch (err) {
    return toErrorResponse(err);
  }
}
