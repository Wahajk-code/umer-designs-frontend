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
  // Test and live values can sit side by side; STRIPE_MODE (default: live in
  // production, test otherwise) picks which is used — keep it identical to the
  // backend's STRIPE_MODE.
  STRIPE_MODE: z.string().default(''),
  STRIPE_WEBHOOK_SECRET_TEST: z.string().default(''),
  STRIPE_WEBHOOK_SECRET_LIVE: z.string().default(''),
  STRIPE_PUBLISHABLE_KEY: z.string().default(''),
  STRIPE_PUBLISHABLE_KEY_TEST: z.string().default(''),
  STRIPE_PUBLISHABLE_KEY_LIVE: z.string().default(''),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

/**
 * Collapses the test/live pairs into the single fields the rest of the app
 * reads (STRIPE_WEBHOOK_SECRET, STRIPE_PUBLISHABLE_KEY), failing fast on a
 * value from the wrong mode.
 */
function withResolvedStripe(env: ServerEnv): ServerEnv {
  const explicit = env.STRIPE_MODE.trim().toLowerCase();
  if (explicit && explicit !== 'test' && explicit !== 'live') {
    throw new Error(`STRIPE_MODE must be "test" or "live" (got "${env.STRIPE_MODE}").`);
  }
  const mode = explicit || (env.NODE_ENV === 'production' ? 'live' : 'test');
  const pick = (test: string, live: string, plain: string) =>
    (mode === 'live' ? live : test).trim() || plain.trim();

  const webhookSecret = pick(env.STRIPE_WEBHOOK_SECRET_TEST, env.STRIPE_WEBHOOK_SECRET_LIVE, env.STRIPE_WEBHOOK_SECRET);
  if (webhookSecret && !webhookSecret.startsWith('whsec_')) {
    throw new Error(
      `STRIPE_WEBHOOK_SECRET_${mode.toUpperCase()} must be a webhook signing secret starting with "whsec_" (not an API key).`,
    );
  }
  const publishableKey = pick(env.STRIPE_PUBLISHABLE_KEY_TEST, env.STRIPE_PUBLISHABLE_KEY_LIVE, env.STRIPE_PUBLISHABLE_KEY);
  if (publishableKey && !publishableKey.startsWith(`pk_${mode}_`)) {
    throw new Error(`Stripe publishable key does not match STRIPE_MODE="${mode}" (expected pk_${mode}_…).`);
  }

  return { ...env, STRIPE_MODE: mode, STRIPE_WEBHOOK_SECRET: webhookSecret, STRIPE_PUBLISHABLE_KEY: publishableKey };
}

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
    cached = withResolvedStripe(parsed.data);
  }
  return cached;
}
