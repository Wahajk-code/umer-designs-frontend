import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/server/current-user';
import { AccountSettingsForms } from './account-settings-forms';

export const metadata: Metadata = { title: 'Settings — Umer Designs' };

export default async function DashboardSettingsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/sign-in?next=/dashboard/settings');
  }

  return (
    <div>
      <h1 className="text-[26px] font-light text-ink-900">Settings</h1>
      <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-ink-500">
        Manage your profile, email, and password.
      </p>

      <AccountSettingsForms user={user} />

      <div className="mt-4 max-w-lg rounded-card-lg bg-white p-6">
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-ink-500">Referral code</span>
          <span className="font-medium text-ink-900">{user.referralCode}</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-[13px]">
          <span className="text-ink-500">Account role</span>
          <span className="font-medium text-ink-900">
            {user.role === 'ADMIN' ? 'Administrator' : 'Customer'}
          </span>
        </div>
      </div>
    </div>
  );
}
