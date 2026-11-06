import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AdminDesignsView } from './admin-designs-view';

export const metadata: Metadata = { title: 'Designs — Admin' };

export default function AdminDesignsPage() {
  return (
    <Suspense>
      <AdminDesignsView />
    </Suspense>
  );
}
