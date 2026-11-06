'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { apiFetch, ApiError } from '@/lib/client/api';

export function BuyButton({
  designId,
  designSlug,
  isSignedIn,
  addOnIds = [],
  modificationOptionIds = [],
}: {
  designId: string;
  designSlug: string;
  isSignedIn: boolean;
  addOnIds?: string[];
  modificationOptionIds?: string[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!isSignedIn) {
      toast.info('Sign in to buy this design', {
        id: 'buy-signin',
        description: 'Browsing is always free — you just need an account to check out.',
      });
      router.push(`/sign-in?next=/designs/${designSlug}`);
      return;
    }

    setLoading(true);
    try {
      const { checkoutUrl } = await apiFetch<{ checkoutUrl: string | null }>('/api/checkout', {
        method: 'POST',
        body: { designId, addOnIds, modificationOptionIds },
      });
      if (!checkoutUrl) {
        // Fully covered by account credit — already paid.
        router.push(`/dashboard?purchased=1${modificationOptionIds.length ? '&mods=1' : ''}`);
        return;
      }
      window.location.href = checkoutUrl; // keep the loading label until Stripe loads
    } catch (err) {
      toast.error('Could not start checkout', {
        id: 'buy-error',
        description: err instanceof ApiError ? err.message : 'Please try again in a moment.',
      });
      setLoading(false);
    }
  }

  const label = modificationOptionIds.length > 0 ? 'Buy plan + changes' : 'Buy — instant download';

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="mt-5 rounded-pill bg-ink-900 px-8 py-3 text-center text-[13px] font-medium text-white transition-colors hover:bg-ink-950 disabled:opacity-60"
    >
      {loading ? 'Redirecting to secure checkout…' : label}
    </button>
  );
}
