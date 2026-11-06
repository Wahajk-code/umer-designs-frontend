import Link from 'next/link';
import type { Metadata } from 'next';
import { CalendarClock, MessageSquare, Video } from 'lucide-react';
import { getCurrentUser } from '@/lib/server/current-user';
import { SiteHeader } from '@/components/marketing/site-header';
import { BookMeetingForm } from '@/components/meetings/book-meeting-form';
import { MyMeetings } from '@/components/meetings/my-meetings';

export const metadata: Metadata = {
  title: 'Schedule a meeting',
  description: 'Book a short call with the Umer Designs architect to talk through a design, your site, or a project already underway.',
};

const POINTS = [
  { icon: <MessageSquare size={15} />, text: 'Talk through a plan, a change request or your site' },
  { icon: <CalendarClock size={15} />, text: 'Pick a time — the architect confirms or suggests another' },
  { icon: <Video size={15} />, text: 'You get the video link by email and in your dashboard' },
];

export default async function ScheduleMeetingPage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-warm-50">
      <SiteHeader isSignedIn={Boolean(user)} />

      <main className="mx-auto max-w-lg px-5 pb-24 pt-8 sm:px-6">
        <div className="text-center">
          <h1 className="text-[28px] font-light text-ink-900">Schedule a meeting</h1>
          <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-ink-500">
            Speak with the architect directly — no sales calls, just the person doing the work.
          </p>
        </div>

        <ul className="mt-6 flex flex-col gap-2">
          {POINTS.map((p) => (
            <li key={p.text} className="flex items-center gap-3 rounded-control bg-white px-4 py-2.5 text-[12.5px] text-ink-700">
              <span className="text-ink-900">{p.icon}</span>
              {p.text}
            </li>
          ))}
        </ul>

        <div className="mt-6 rounded-card-lg bg-white p-6 shadow-[0_1px_5px_rgba(0,0,0,0.04)]">
          {user ? (
            <BookMeetingForm />
          ) : (
            <div className="py-4 text-center">
              <p className="text-[13px] text-ink-700">Sign in to request a time.</p>
              <p className="mt-1 text-[12px] text-ink-500">We use your account to send the confirmation and link.</p>
              <Link
                href="/sign-in?next=/schedule-a-meeting"
                className="mt-5 inline-block rounded-pill bg-ink-900 px-6 py-3 text-[13px] font-medium text-white transition-colors hover:bg-ink-950"
              >
                Sign in
              </Link>
            </div>
          )}
        </div>

        {user && <MyMeetings />}
      </main>
    </div>
  );
}
