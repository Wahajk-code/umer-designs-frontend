import { z } from 'zod';

/**
 * Fail-fast server-side env validation (invoked once from
 * src/instrumentation.ts at boot). None of these are NEXT_PUBLIC_* — the
 * backend's address and the internal signing secret must never reach a
 * client bundle.
 *
 * No 'server-only' guard here (deliberately): this module is also imported
 * by server.ts's WebSocket proxy, which runs outside Next's own module
 * pipeline — the 'server-only' package throws unconditionally there rather
 * than being a no-op. Nothing in src/lib/server/** is ever imported from a
 * 'use client' file; the directory boundary is the real guard.
 */
const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
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
