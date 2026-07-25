'use client';

import { useEffect, useState, FormEvent } from 'react';
import { apiFetch, ApiError } from '@/lib/client/api';
import { uploadToCloudinary } from '@/lib/client/cloudinary-upload';
import { Modification, ModificationStatus } from '@/lib/types/modification';
import { formatCents } from '@/lib/client/format';

interface UploadSignature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
}

const NEXT_STATUS: Partial<Record<ModificationStatus, ModificationStatus[]>> = {
  SUBMITTED: ['IN_REVIEW'],
  IN_REVIEW: ['IN_PROGRESS'],
  IN_PROGRESS: ['REVISION', 'DELIVERED'],
  REVISION: ['IN_PROGRESS', 'DELIVERED'],
  DELIVERED: [],
};

export function AdminModificationDetail({ modificationId }: { modificationId: string }) {
  const [modification, setModification] = useState<Modification | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [label, setLabel] = useState('');
  const [uploading, setUploading] = useState(false);

  async function load() {
    try {
      // The user-facing route already grants admins access (checked server-side against the JWT role).
      const data = await apiFetch<Modification>(`/api/modifications/${modificationId}`);
      setModification(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load this request.');
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount pattern
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modificationId]);

  async function handleStatusChange(status: ModificationStatus) {
    try {
      await apiFetch(`/api/admin/modifications/${modificationId}/status`, {
        method: 'PATCH',
        body: { status },
      });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update status.');
    }
  }

  async function handleComment(event: FormEvent) {
    event.preventDefault();
    if (!comment.trim()) return;
    await apiFetch(`/api/modifications/${modificationId}/comments`, {
      method: 'POST',
      body: { comment },
    });
    setComment('');
    load();
  }

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const signature = await apiFetch<UploadSignature>(
        `/api/admin/modifications/${modificationId}/upload-signature`,
        { method: 'POST' },
      );
      const result = await uploadToCloudinary(file, signature);
      await apiFetch(`/api/admin/modifications/${modificationId}/files`, {
        method: 'POST',
        body: {
          label: label || file.name,
          cloudinaryPublicId: result.public_id,
          resourceType: result.resource_type,
          format: result.format,
          isFinal: modification?.status === 'DELIVERED',
        },
      });
      setLabel('');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  if (error) return <p className="text-[12px] text-red-400">{error}</p>;
  if (!modification) return <p className="text-[12px] text-dark-500">Loading…</p>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-[18px] font-medium text-white">
        {modification.design.title} — #{modification.id.slice(0, 8)}
      </h1>
      <p className="mt-1 text-[12px] text-dark-500">{formatCents(modification.totalAmountCents)}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {(NEXT_STATUS[modification.status] ?? []).map((status) => (
          <button
            key={status}
            onClick={() => handleStatusChange(status)}
            className="bg-ink-950 px-4 py-2 text-[11px] text-white hover:bg-black"
          >
            Move to {status.replace('_', ' ').toLowerCase()}
          </button>
        ))}
        {NEXT_STATUS[modification.status]?.length === 0 && (
          <span className="text-[11px] text-dark-500">Delivered — no further transitions.</span>
        )}
      </div>

      <div className="mt-6 bg-white p-4">
        <div className="text-[10px] tracking-wide text-dark-500">TIMELINE</div>
        <ul className="mt-2 flex flex-col gap-2">
          {modification.events.map((e) => (
            <li key={e.id} className="text-[12px] text-ink-700">
              {e.kind === 'STATUS_CHANGE' ? (
                <span>
                  {e.fromStatus ? `${e.fromStatus} → ` : ''}
                  <b>{e.toStatus}</b>
                </span>
              ) : (
                <span>
                  <b>{e.author?.role === 'ADMIN' ? 'You' : 'Client'}:</b> {e.comment}
                </span>
              )}
            </li>
          ))}
        </ul>
        <form onSubmit={handleComment} noValidate className="mt-3 flex gap-2">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment…"
            className="h-9 flex-1 border border-warm-400 px-3 text-[12px] outline-none"
          />
          <button className="bg-ink-950 px-4 text-[11px] text-white">Send</button>
        </form>
      </div>

      <div className="mt-4 bg-white p-4">
        <div className="text-[10px] tracking-wide text-dark-500">FILES</div>
        <ul className="mt-2 flex flex-col gap-1">
          {modification.files.map((f) => (
            <li key={f.id} className="text-[12px] text-ink-700">
              {f.label} <span className="text-dark-500">· {f.format}{f.isFinal ? ' · final' : ''}</span>
            </li>
          ))}
          {modification.files.length === 0 && <li className="text-[12px] text-dark-500">No files yet.</li>}
        </ul>
        <div className="mt-3 flex items-center gap-2">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="File label"
            className="h-9 flex-1 border border-warm-400 px-3 text-[12px] outline-none"
          />
          <label className="flex h-9 cursor-pointer items-center bg-ink-950 px-4 text-[11px] text-white">
            {uploading ? 'Uploading…' : 'Upload'}
            <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>
      </div>
    </div>
  );
}
