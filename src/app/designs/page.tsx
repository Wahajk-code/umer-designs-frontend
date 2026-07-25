import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/server/current-user';
import { ShopBanner } from '@/components/shop/shop-banner';
import { ShopHeader } from '@/components/shop/shop-header';
import { StoreView } from './store-view';

export const metadata: Metadata = {
  title: 'Find your plan',
  description:
    'Browse architect-drawn container and residential home designs, priced and ready to build. Buy online and unlock the full CAD + PDF set instantly.',
};

export default async function StorePage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-warm-50">
      <ShopBanner />
      <ShopHeader isSignedIn={Boolean(user)} />
      <main className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 lg:px-12">
        <h1 className="mt-6 text-[28px] font-light text-ink-900 sm:text-[34px]">Find your plan</h1>
        <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-ink-500">
          Every design is buildable from day one. Pay once — the files are yours forever.
        </p>
        <StoreView />
      </main>
    </div>
  );
}
