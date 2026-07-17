'use client';

import { useEffect, useState } from 'react';
import { apiFetch, ApiError } from '@/lib/client/api';
import { formatCents } from '@/lib/client/format';
import { Button } from '@/components/ui/button';

interface PaymentLinkPreview {
  description: string;
  amountCents: number;
  status: 'OPEN' | 'PAID' | 'EXPIRED' | 'CANCELLED';
  expiresAt: string;
}

export function PayView({ token }: { token: string }) {
  const [preview, setPreview] = useState<PaymentLinkPreview | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch<PaymentLinkPreview>(`/api/payment-links/${token}`)
      .then(setPreview)
      .catch((err) => {
        setPreview(null);
        setError(err instanceof ApiError ? err.message : 'This payment link is invalid.');
      });
  }, [token]);

  async function handlePay() {
    setLoading(true);
    setError(null);
    try {
      const { checkoutUrl } = await apiFetch<{ checkoutUrl: string }>(`/api/payment-links/${token}/redeem`, {
        method: 'POST',
      });
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not start checkout.');
      setLoading(false);
    }
  }

  if (preview === undefined) {
    return <div className="h-40 animate-pulse rounded-card-lg bg-warm-150" />;
  }

  if (!preview) {
    return <p className="text-[13px] text-red-600">{error ?? 'This payment link is invalid.'}</p>;
  }

  if (preview.status !== 'OPEN') {
    const label = { PAID: 'already been paid', EXPIRED: 'expired', CANCELLED: 'been cancelled' }[preview.status];
    return <p className="text-[13px] text-ink-700">This payment link has {label}.</p>;
  }

  return (
    <div className="rounded-card-lg bg-white p-6">
      <div className="text-[10px] tracking-[0.12em] text-ink-500">PAYMENT REQUEST</div>
      <p className="mt-2 text-[15px] text-ink-900">{preview.description}</p>
      <div className="mt-4 text-[26px] font-light text-ink-900">{formatCents(preview.amountCents)}</div>
      {error && <p className="mt-3 text-[12px] text-red-600">{error}</p>}
      <Button onClick={handlePay} disabled={loading} className="mt-5 w-full">
        {loading ? 'Redirecting to checkout…' : `Pay ${formatCents(preview.amountCents)}`}
      </Button>
    </div>
  );
}
