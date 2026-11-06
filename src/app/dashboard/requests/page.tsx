import type { Metadata } from 'next';
import { RequestsList } from './requests-list';

export const metadata: Metadata = { title: 'Requests & tracking' };

export default function RequestsPage() {
  return <RequestsList />;
}
