import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, FolderOpen, Wallet } from 'lucide-react';
import { getCurrentUser } from '@/lib/server/current-user';
import { ActiveRequest } from './active-request';
import { OverviewStats } from './overview-stats';

export const metadata: Metadata = { title: 'Overview — Umer Designs' };

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <div>
      <h1 className="text-[26px] font-light text-ink-900">Good to see you, {user?.firstName} 👋</h1>
      <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-ink-500">
        Track requests, message the architect, and manage your credit balance — all in one place.
      </p>

      <div className="mt-7">
        <ActiveRequest />
      </div>

      <OverviewStats />

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/designs"
          className="group flex items-center justify-between rounded-card-lg bg-white p-6 transition-shadow duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.07)]"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-warm-100 text-ink-900">
              <FolderOpen size={18} />
            </div>
            <div>
              <div className="text-[14px] font-medium text-ink-900">My designs</div>
              <div className="mt-0.5 text-[11.5px] text-ink-500">Re-download files, view order history</div>
            </div>
          </div>
          <ArrowRight size={16} className="text-ink-500 transition-transform group-hover:translate-x-1" />
        </Link>
        <Link
          href="/dashboard/referrals"
          className="group flex items-center justify-between rounded-card-lg bg-white p-6 transition-shadow duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.07)]"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-warm-100 text-ink-900">
              <Wallet size={18} />
            </div>
            <div>
              <div className="text-[14px] font-medium text-ink-900">Referrals & credits</div>
              <div className="mt-0.5 text-[11.5px] text-ink-500">Share your link, spend your balance</div>
            </div>
          </div>
          <ArrowRight size={16} className="text-ink-500 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
