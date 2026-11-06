import { NextResponse } from 'next/server';
import { callBackend } from '@/lib/server/backend-client';
import { getAccessToken } from '@/lib/server/session-response';
import { toErrorResponse } from '@/lib/server/api-error';

/** Signature for public storefront photos (cover + gallery). */
export async function POST(): Promise<NextResponse> {
  try {
    const accessToken = await getAccessToken();
    const data = await callBackend('/admin/designs/image-signature', { method: 'POST', accessToken });
    return NextResponse.json(data);
  } catch (err) {
    return toErrorResponse(err);
  }
}
