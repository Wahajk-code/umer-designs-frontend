import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Admin — Umer Designs' };

export default function AdminOverviewPage() {
  return (
    <div>
      <h1 className="text-[22px] font-light text-white">Admin</h1>
      <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-dark-500">
        Design listings, orders, the modification queue, payment links, and referral settings land
        here module by module.
      </p>
    </div>
  );
}
