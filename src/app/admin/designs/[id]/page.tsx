import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { callBackend, BackendError } from '@/lib/server/backend-client';
import { getAccessToken } from '@/lib/server/session-response';
import { Design } from '@/lib/types/design';
import { DesignForm } from '../design-form';
import { DesignFilesManager } from './design-files-manager';

export const metadata: Metadata = { title: 'Edit design — Admin' };

async function getDesign(id: string): Promise<Design | null> {
  const accessToken = await getAccessToken();
  try {
    return await callBackend<Design>(`/admin/designs/${id}`, { accessToken });
  } catch (err) {
    if (err instanceof BackendError && err.statusCode === 404) return null;
    throw err;
  }
}

export default async function EditDesignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const design = await getDesign(id);
  if (!design) notFound();

  return (
    <div>
      <h1 className="text-[18px] font-medium text-white">{design.title}</h1>
      <p className="mt-1 text-[12px] text-dark-500">{design.status}</p>

      <div className="mt-6">
        <DesignForm design={design} />
      </div>

      <div className="mt-10">
        <h2 className="text-[13px] font-medium text-white">Files</h2>
        <div className="mt-3">
          <DesignFilesManager designId={design.id} initialFiles={design.files ?? []} />
        </div>
      </div>
    </div>
  );
}
