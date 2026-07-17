import type { Metadata } from 'next';
import { AdminModificationDetail } from './admin-modification-detail';

export const metadata: Metadata = { title: 'Modification request — Admin' };

export default async function AdminModificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminModificationDetail modificationId={id} />;
}
