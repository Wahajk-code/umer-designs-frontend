import 'server-only';
import { z } from 'zod';

/**
 * Fail-fast server-side env validation (invoked once from
 * src/instrumentation.ts at boot). None of these are NEXT_PUBLIC_* — the
 * backend's address and the internal signing secret must never reach a
 * client bundle.
 */
const serverEnvSchema = z.object({
  // Trimmed first: a stray trailing space/newline from pasting into a
  // hosting panel's env-var field otherwise fails this enum check even
  // though the intended value ("production", etc.) is correct.
  NODE_ENV: z.preprocess(
    (v) => (typeof v === 'string' ? v.trim() : v),
    z.enum(['development', 'test', 'production']),
  ).default('development'),
  PORT: z.string().default('3000'),

  // Server-to-server only. Never referenced from a 'use client' file.
  INTERNAL_API_URL: z.string().url(),
  INTERNAL_HMAC_SECRET: z.string().min(32),

  APP_ORIGIN: z.string().url(),

  // Optional, like the backend's third-party keys: the app boots and works
  // without it, the Stripe webhook route just returns 503 until it's set.
  STRIPE_WEBHOOK_SECRET: z.string().default(''),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | undefined;

export function getServerEnv(): ServerEnv {
  if (!cached) {
    const parsed = serverEnvSchema.safeParse(process.env);
    if (!parsed.success) {
      throw new Error(
        `Invalid/missing server environment variables:\n${parsed.error.issues
          .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
          .join('\n')}`,
      );
    }
    cached = parsed.data;
  }
  return cached;
}
