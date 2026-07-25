import Link from 'next/link';
import { getCurrentUser } from '@/lib/server/current-user';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';

export default async function NotFound() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-warm-50">
      <SiteHeader isSignedIn={Boolean(user)} />
      <main className="mx-auto flex max-w-7xl flex-col items-center px-5 py-24 text-center sm:px-8 lg:px-12">
        <span className="text-[13px] font-medium tracking-[0.2em] text-ink-500">404</span>
        <h1 className="mt-4 text-[32px] font-light text-ink-900 sm:text-[42px]">Page not found</h1>
        <p className="mt-3 max-w-md text-[13.5px] leading-relaxed text-ink-500">
          The page you&apos;re looking for doesn&apos;t exist or may have moved. Let&apos;s get you back
          on track.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-pill bg-ink-900 px-7 py-3.5 text-[13px] font-medium text-white transition-transform hover:scale-[1.03]"
          >
            Back to homepage
          </Link>
          <Link
            href="/designs"
            className="rounded-pill border border-ink-900 px-7 py-3.5 text-[13px] text-ink-900 transition-colors hover:bg-warm-100"
          >
            Browse the store
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
