import type { Metadata } from 'next';
import { AdminPaymentLinksView } from './admin-payment-links-view';

export const metadata: Metadata = { title: 'Payment links — Admin' };

export default function AdminPaymentLinksPage() {
  return <AdminPaymentLinksView />;
}
