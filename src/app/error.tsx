'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/brand/logo';

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-warm-50 px-6 py-12 text-center">
      <Link href="/" className="mb-8">
        <Logo size="lg" />
      </Link>
      <span className="text-[13px] font-medium tracking-[0.2em] text-ink-500">ERROR</span>
      <h1 className="mt-4 text-[28px] font-light text-ink-900 sm:text-[34px]">Something went wrong</h1>
      <p className="mt-3 max-w-md text-[13.5px] leading-relaxed text-ink-500">
        An unexpected error occurred. You can try again, or head back to the homepage.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          onClick={() => unstable_retry()}
          className="rounded-pill bg-ink-900 px-7 py-3.5 text-[13px] font-medium text-white transition-transform hover:scale-[1.03]"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-pill border border-ink-900 px-7 py-3.5 text-[13px] text-ink-900 transition-colors hover:bg-warm-100"
        >
          Back to homepage
        </Link>
      </div>
    </div>
  );
}
