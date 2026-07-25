import Link from 'next/link';
import type { Metadata } from 'next';
import { Logo } from '@/components/brand/logo';
import { PayView } from './pay-view';

export const metadata: Metadata = {
  title: 'Pay',
  robots: { index: false, follow: false },
};

export default async function PayPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-warm-50 px-6 py-12">
      <Link href="/" className="mb-8">
        <Logo size="lg" />
      </Link>
      <div className="w-full max-w-md">
        <PayView token={token} />
      </div>
    </div>
  );
}
