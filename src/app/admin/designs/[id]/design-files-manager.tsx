'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Eye, FileText, Trash2, UploadCloud } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/client/api';
import { uploadToCloudinary } from '@/lib/client/cloudinary-upload';
import { DesignFile } from '@/lib/types/design';
import { Lightbox } from '@/components/ui/lightbox';
import { AdminButton, ConfirmDialog, EmptyState, adminInput } from '@/components/admin/admin-ui';

interface UploadSignature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
}

/** Private, purchasable plan files (CAD/PDF). Delivered to buyers via signed, expiring URLs only. */
export function DesignFilesManager({ designId, initialFiles }: { designId: string; initialFiles: DesignFile[] }) {
  const [files, setFiles] = useState(initialFiles);
  const [label, setLabel] = useState('');
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoadingId, setPreviewLoadingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<DesignFile | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handlePreview(fileId: string) {
    setPreviewLoadingId(fileId);
    try {
      const { url } = await apiFetch<{ url: string }>(`/api/admin/designs/${designId}/files/${fileId}/preview-url`);
      setPreviewUrl(url);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not load preview.');
    } finally {
      setPreviewLoadingId(null);
    }
  }

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const signature = await apiFetch<UploadSignature>(`/api/admin/designs/${designId}/upload-signature`, { method: 'POST' });
      const result = await uploadToCloudinary(file, signature);
      const created = await apiFetch<DesignFile>(`/api/admin/designs/${designId}/files`, {
        method: 'POST',
        body: { label: label.trim() || file.name, cloudinaryPublicId: result.public_id, resourceType: result.resource_type, format: result.format },
      });
      setFiles((prev) => [...prev, created]);
      setLabel('');
      toast.success(`${created.label} uploaded`);
    } catch (err) {
      toast.error('Upload failed', { description: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setUploading(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/admin/designs/${designId}/files/${pendingDelete.id}`, { method: 'DELETE' });
      setFiles((prev) => prev.filter((f) => f.id !== pendingDelete.id));
      toast.success('File removed');
      setPendingDelete(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not remove file.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <p className="text-[12px] leading-relaxed text-ink-500">
        These are what buyers download after paying. They&apos;re stored privately and only ever shared through short-lived links.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label (e.g. Full CAD set) — optional"
          className={`${adminInput} min-w-0 flex-1`}
        />
        <label
          className={`inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-pill bg-ink-950 px-5 text-[12.5px] font-medium text-white transition-colors hover:bg-black ${
            uploading ? 'pointer-events-none opacity-60' : ''
          }`}
        >
          {uploading ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <UploadCloud size={14} />
          )}
          {uploading ? 'Uploading…' : 'Upload file'}
          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      <div className="mt-4 overflow-hidden rounded-card-sm bg-panel-100 ring-1 ring-panel-300">
        {files.length === 0 ? (
          <EmptyState icon={<FileText size={18} />} title="No plan files yet" hint="Upload the drawings buyers receive. A design without files can't be delivered." />
        ) : (
          <ul className="divide-y divide-panel-300">
            {files.map((file) => (
              <li key={file.id} className="flex items-center gap-3 px-4 py-3">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-control bg-panel-200 text-ink-700">
                  <FileText size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12.5px] text-ink-900">{file.label}</div>
                  <div className="text-[10.5px] uppercase tracking-wide text-ink-500">
                    {file.format} · {new Date(file.createdAt).toLocaleDateString()}
                  </div>
                </div>
                {file.resourceType === 'image' && (
                  <AdminButton size="sm" variant="ghost" icon={<Eye size={13} />} loading={previewLoadingId === file.id} onClick={() => handlePreview(file.id)}>
                    Preview
                  </AdminButton>
                )}
                <button
                  onClick={() => setPendingDelete(file)}
                  aria-label={`Remove ${file.label}`}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Lightbox open={!!previewUrl} images={previewUrl ? [{ src: previewUrl, alt: 'File preview' }] : []} index={0} onClose={() => setPreviewUrl(null)} onIndexChange={() => undefined} />

      <ConfirmDialog
        open={!!pendingDelete}
        title="Remove this file?"
        body={`"${pendingDelete?.label}" will be deleted from storage. Buyers who already downloaded it keep their copy.`}
        confirmLabel="Remove file"
        danger
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
}
