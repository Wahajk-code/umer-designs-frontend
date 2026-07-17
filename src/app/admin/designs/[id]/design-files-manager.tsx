'use client';

import { useState } from 'react';
import { apiFetch, ApiError } from '@/lib/client/api';
import { uploadToCloudinary } from '@/lib/client/cloudinary-upload';
import { DesignFile } from '@/lib/types/design';

interface UploadSignature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
}

export function DesignFilesManager({
  designId,
  initialFiles,
}: {
  designId: string;
  initialFiles: DesignFile[];
}) {
  const [files, setFiles] = useState(initialFiles);
  const [label, setLabel] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const signature = await apiFetch<UploadSignature>(
        `/api/admin/designs/${designId}/upload-signature`,
        { method: 'POST' },
      );
      const result = await uploadToCloudinary(file, signature);
      const created = await apiFetch<DesignFile>(`/api/admin/designs/${designId}/files`, {
        method: 'POST',
        body: {
          label: label || file.name,
          cloudinaryPublicId: result.public_id,
          resourceType: result.resource_type,
          format: result.format,
        },
      });
      setFiles((prev) => [...prev, created]);
      setLabel('');
    } catch (err) {
      setError(err instanceof ApiError || err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(fileId: string) {
    try {
      await apiFetch(`/api/admin/designs/${designId}/files/${fileId}`, { method: 'DELETE' });
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not remove file.');
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="File label (e.g. Full CAD set)"
          className="h-9 flex-1 border border-warm-400 px-3 text-[12px] outline-none"
        />
        <label className="flex h-9 cursor-pointer items-center bg-ink-950 px-4 text-[11px] text-white hover:bg-black">
          {uploading ? 'Uploading…' : 'Upload file'}
          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>
      {error && <p className="mt-2 text-[12px] text-red-600">{error}</p>}

      <ul className="mt-4 divide-y divide-warm-150 border border-warm-150">
        {files.map((file) => (
          <li key={file.id} className="flex items-center justify-between px-3 py-2 text-[12px]">
            <span className="text-ink-900">
              {file.label} <span className="text-dark-500">· {file.format}</span>
            </span>
            <button onClick={() => handleDelete(file.id)} className="text-red-600 underline">
              remove
            </button>
          </li>
        ))}
        {files.length === 0 && <li className="px-3 py-3 text-[12px] text-dark-500">No files yet.</li>}
      </ul>
    </div>
  );
}
