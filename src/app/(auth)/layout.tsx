import Link from 'next/link';
import { Logo } from '@/components/brand/logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-warm-50 px-6 py-12">
      <Link href="/" className="mb-10">
        <Logo size="lg" />
      </Link>
      <div className="w-full max-w-md rounded-card-lg bg-white p-8 shadow-[0_1px_5px_rgba(0,0,0,0.05)]">
        {children}
      </div>
    </div>
  );
}
