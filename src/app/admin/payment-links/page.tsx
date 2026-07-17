import type { Metadata } from 'next';
import { AdminPaymentLinksView } from './admin-payment-links-view';

export const metadata: Metadata = { title: 'Payment links — Admin' };

export default function AdminPaymentLinksPage() {
  return (
    <div>
      <h1 className="text-[18px] font-medium text-white">Payment links</h1>
      <div className="mt-4">
        <AdminPaymentLinksView />
      </div>
    </div>
  );
}
