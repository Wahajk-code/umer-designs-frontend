import Link from 'next/link';
import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/server/current-user';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { BookMeetingForm } from '@/components/meetings/book-meeting-form';

export const metadata: Metadata = { title: 'Schedule a meeting — Umer Designs' };

export default async function ScheduleMeetingPage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-warm-50">
      <header className="flex items-center justify-between px-5 py-4 sm:px-10">
        <Link href="/">
          <Logo size="sm" withTagline={false} />
        </Link>
        <nav className="hidden gap-1 rounded-pill bg-white p-1.5 text-[12px] text-ink-700 shadow-[0_1px_4px_rgba(0,0,0,0.05)] sm:flex">
          <Link href="/" className="rounded-pill px-4 py-2 hover:bg-warm-100">
            Home
          </Link>
          <Link href="/designs" className="rounded-pill px-4 py-2 hover:bg-warm-100">
            Designs
          </Link>
          <Link href="/schedule-a-meeting" className="rounded-pill bg-ink-900 px-4 py-2 text-white">
            Schedule a meeting
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-md px-5 pb-24 pt-6 sm:px-10">
        <h1 className="text-[26px] font-light text-ink-900">Pick a time</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-500">
          Talk through a design, a modification request, or anything else with the architect
          directly — no sales calls, just the person doing the work.
        </p>

        <div className="mt-6 rounded-card-lg bg-white p-6">
          {user ? (
            <BookMeetingForm />
          ) : (
            <div className="text-center">
              <p className="text-[13px] text-ink-500">Sign in to request a time.</p>
              <Link href="/sign-in?next=/schedule-a-meeting" className="mt-4 inline-block">
                <Button>Sign in</Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
