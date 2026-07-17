'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/client/api';

export function BuyButton({
  designId,
  designSlug,
  isSignedIn,
}: {
  designId: string;
  designSlug: string;
  isSignedIn: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (!isSignedIn) {
      router.push(`/sign-in?next=/designs/${designSlug}`);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { checkoutUrl } = await apiFetch<{ checkoutUrl: string }>('/api/checkout', {
        method: 'POST',
        body: { designId },
      });
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not start checkout. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="mt-5 rounded-pill bg-ink-900 px-8 py-3 text-center text-[13px] font-medium text-white transition-colors hover:bg-ink-950 disabled:opacity-50"
      >
        {loading ? 'Redirecting to checkout…' : 'Buy — instant download'}
      </button>
      {error && <p className="mt-2 text-[12px] text-red-600">{error}</p>}
    </div>
  );
}
