'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
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

  async function handleClick() {
    if (!isSignedIn) {
      toast.info('Sign in to buy this design', {
        description: 'Browsing is always free — you just need an account to check out.',
      });
      router.push(`/sign-in?next=/designs/${designSlug}`);
      return;
    }

    setLoading(true);
    try {
      const { checkoutUrl } = await apiFetch<{ checkoutUrl: string }>('/api/checkout', {
        method: 'POST',
        body: { designId },
      });
      window.location.href = checkoutUrl;
    } catch (err) {
      toast.error('Could not start checkout', {
        description: err instanceof ApiError ? err.message : 'Please try again in a moment.',
      });
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="mt-5 rounded-pill bg-ink-900 px-8 py-3 text-center text-[13px] font-medium text-white transition-colors hover:bg-ink-950 disabled:opacity-50"
    >
      {loading ? 'Redirecting to checkout…' : 'Buy — instant download'}
    </button>
  );
}
