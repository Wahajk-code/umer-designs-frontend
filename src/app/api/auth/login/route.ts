import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { callBackend } from '@/lib/server/backend-client';
import { setSessionCookies, IssuedTokens } from '@/lib/server/session-response';
import { toErrorResponse } from '@/lib/server/api-error';
import { SafeUser } from '@/lib/types/user';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(72),
});

interface AuthResult {
  user: SafeUser;
  tokens: IssuedTokens;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const json = await request.json().catch(() => ({}));
    const body = loginSchema.parse(json);

    const result = await callBackend<AuthResult>('/auth/login', {
      method: 'POST',
      body,
    });

    await setSessionCookies(result.tokens);
    return NextResponse.json({ user: result.user });
  } catch (err) {
    return toErrorResponse(err);
  }
}
