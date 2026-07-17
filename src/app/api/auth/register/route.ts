import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { callBackend } from '@/lib/server/backend-client';
import { setSessionCookies, IssuedTokens } from '@/lib/server/session-response';
import { toErrorResponse } from '@/lib/server/api-error';
import { SafeUser } from '@/lib/types/user';

const registerSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(10)
    .max(72)
    .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: 'Password must contain an uppercase letter, a lowercase letter, and a number.',
    }),
  firstName: z.string().min(1).max(60),
  lastName: z.string().min(1).max(60),
  referralCode: z.string().max(20).optional(),
});

interface AuthResult {
  user: SafeUser;
  tokens: IssuedTokens;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const json = await request.json().catch(() => ({}));
    const body = registerSchema.parse(json);

    const result = await callBackend<AuthResult>('/auth/register', {
      method: 'POST',
      body,
    });

    await setSessionCookies(result.tokens);
    return NextResponse.json({ user: result.user }, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
