import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerEnv } from '@/lib/server/env';
import { callBackend } from '@/lib/server/backend-client';

/**
 * The public-facing Stripe webhook endpoint — deliberately on the BFF, not
 * the backend, so Stripe's dashboard never sees the backend's address. This
 * route verifies the Stripe signature itself (the one non-negotiable step),
 * then forwards a minimal, already-trusted payload to Nest over the internal
 * HMAC-attested channel for idempotent processing.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const env = getServerEnv();
  if (!env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { statusCode: 503, error: 'Service Unavailable', message: 'Stripe webhooks are not configured yet.' },
      { status: 503 },
    );
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json(
      { statusCode: 400, error: 'Bad Request', message: 'Missing stripe-signature header.' },
      { status: 400 },
    );
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    // The API key here is never used for a network call — constructEvent is
    // pure local HMAC verification against STRIPE_WEBHOOK_SECRET. The BFF
    // has no reason to hold the Stripe *secret* API key at all.
    const stripe = new Stripe('sk_not_used_for_webhook_verification');
    event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json(
      { statusCode: 400, error: 'Bad Request', message: 'Invalid Stripe signature.' },
      { status: 400 },
    );
  }

  let checkoutSessionId: string | undefined;
  let paymentIntentId: string | undefined;
  let metadata: Record<string, string> | undefined;

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    checkoutSessionId = session.id;
    paymentIntentId =
      typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;
    metadata = session.metadata ?? undefined;
  }

  await callBackend('/webhooks/stripe', {
    method: 'POST',
    body: { eventId: event.id, eventType: event.type, checkoutSessionId, paymentIntentId, metadata },
  });

  return NextResponse.json({ received: true });
}
