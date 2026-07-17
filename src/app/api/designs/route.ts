import { NextRequest, NextResponse } from 'next/server';
import { callBackend } from '@/lib/server/backend-client';
import { toErrorResponse } from '@/lib/server/api-error';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const qs = request.nextUrl.search;
    const data = await callBackend(`/designs${qs}`);
    return NextResponse.json(data);
  } catch (err) {
    return toErrorResponse(err);
  }
}
