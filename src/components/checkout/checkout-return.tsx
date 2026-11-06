'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/client/api';
import type { Order } from '@/lib/types/order';
import type { Modification } from '@/lib/types/modification';

const POLL_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 25; // ~50s — Stripe webhooks normally land in 1-5s
const RECENT_MS = 15 * 60 * 1000;

const isRecent = (iso: string | null) => Boolean(iso) && Date.now() - new Date(iso as string).getTime() < RECENT_MS;

/**
 * Stripe redirects back the instant the card is charged, but the order is only
 * marked PAID when the webhook arrives a moment later. This waits for that
 * (instead of showing "nothing purchased yet"), then drops the customer
 * straight on the right page: their designs, or the new request's tracking page.
 */
export function CheckoutReturn() {
  const router = useRouter();
  const [state, setState] = useState<'idle' | 'waiting' | 'slow'>('idle');
  const [kind, setKind] = useState<'purchase' | 'modification'>('purchase');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isPurchase = params.get('purchased') === '1';
    const isModification = params.get('modification') === 'submitted';
    const withChanges = params.get('mods') === '1'; // plan bought together with changes
    if (!isPurchase && !isModification) return;

    let cancelled = false;
    let timer: number | undefined;
    let attempts = 0;

    async function findTarget(): Promise<string | null> {
      if (isPurchase) {
        const orders = await apiFetch<Order[]>('/api/orders');
        if (!orders.some((o) => o.status === 'PAID' && isRecent(o.paidAt))) return null;
        if (!withChanges) return '/dashboard/designs';
        // Changes were bought with the plan: open their tracking page.
        const mods = await apiFetch<Modification[]>('/api/modifications');
        const fresh = mods.find((m) => isRecent(m.createdAt));
        return fresh ? `/dashboard/requests/${fresh.id}` : null;
      }
      const mods = await apiFetch<Modification[]>('/api/modifications');
      const fresh = mods.find((m) => isRecent(m.createdAt));
      return fresh ? `/dashboard/requests/${fresh.id}` : null;
    }

    // Local dev: Stripe can't reach localhost to send the webhook, so ask the
    // backend to verify the session with Stripe and settle it. A no-op (404) in
    // production, where the real webhook does this.
    const sessionId = params.get('session_id');
    const confirmed = sessionId
      ? apiFetch('/api/payments/confirm', { method: 'POST', body: { sessionId } }).catch(() => undefined)
      : Promise.resolve();

    async function tick() {
      if (cancelled) return;
      await confirmed;
      if (cancelled) return;
      attempts += 1;
      try {
        const target = await findTarget();
        if (cancelled) return;
        if (target) {
          toast.success(isPurchase ? 'Payment confirmed — your files are ready.' : 'Payment confirmed — request submitted.');
          router.replace(target);
          return;
        }
      } catch {
        /* transient — keep polling */
      }
      if (attempts >= MAX_ATTEMPTS) {
        setState('slow');
        return;
      }
      timer = window.setTimeout(tick, POLL_INTERVAL_MS);
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- reacting to the URL on mount
    setKind(isPurchase ? 'purchase' : 'modification');
    setState('waiting');
    tick();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [router]);

  if (state === 'idle') return null;

  return (
    <div role="status" className="mb-6 flex items-start gap-3 rounded-card-lg bg-white p-5 shadow-[0_1px_5px_rgba(0,0,0,0.05)]">
      {state === 'waiting' ? (
        <Loader2 size={18} className="mt-0.5 shrink-0 animate-spin text-ink-900" />
      ) : (
        <Check size={18} className="mt-0.5 shrink-0 text-ink-900" />
      )}
      <div className="text-[12.5px] leading-relaxed text-ink-700">
        {state === 'waiting' ? (
          <>
            <div className="font-medium text-ink-900">Confirming your payment…</div>
            This only takes a few seconds. You&apos;ll be taken to{' '}
            {kind === 'purchase' ? 'your designs' : 'your request'} automatically.
          </>
        ) : (
          <>
            <div className="font-medium text-ink-900">Your payment went through</div>
            It&apos;s still being processed on our side — this can take a minute. Nothing is lost and you
            won&apos;t be charged twice. Check{' '}
            <Link
              href={kind === 'purchase' ? '/dashboard/designs' : '/dashboard'}
              className="underline underline-offset-2"
            >
              {kind === 'purchase' ? 'My designs' : 'your dashboard'}
            </Link>{' '}
            shortly, or contact us if it doesn&apos;t appear.
          </>
        )}
      </div>
    </div>
  );
}

/** Tells the customer that backing out of Stripe Checkout charged nothing. */
export function useCheckoutCancelledToast() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'cancelled' || params.get('modification') === 'cancelled') {
      toast('Checkout cancelled', { description: 'You were not charged.' });
      params.delete('checkout');
      params.delete('modification');
      const qs = params.toString();
      window.history.replaceState(null, '', window.location.pathname + (qs ? `?${qs}` : ''));
    }
  }, []);
}
