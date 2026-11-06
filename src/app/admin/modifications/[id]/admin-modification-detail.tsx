'use client';

/* eslint-disable @next/next/no-img-element -- admin thumbnails may be any URL */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Download, ExternalLink, FileText, Mail, MessagesSquare, Trash2, UploadCloud } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/client/api';
import { uploadToCloudinary } from '@/lib/client/cloudinary-upload';
import { Modification, ModificationFile } from '@/lib/types/modification';
import { formatCents } from '@/lib/client/format';
import {
  AdminPageHeader,
  Avatar,
  ConfirmDialog,
  ErrorBanner,
  Panel,
  PanelHeader,
  Pill,
  Skeleton,
  StatusBadge,
  Toggle,
  adminInput,
  fullName,
} from '@/components/admin/admin-ui';
import { Conversation } from '@/components/admin/conversation';
import { ProgressControl } from '@/components/admin/progress-control';

interface UploadSignature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
}

export function AdminModificationDetail({ modificationId }: { modificationId: string }) {
  const [modification, setModification] = useState<Modification | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setModification(await apiFetch<Modification>(`/api/modifications/${modificationId}`));
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load this request.');
    }
  }, [modificationId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount + light polling for new client messages
    load();
    const t = setInterval(() => document.visibilityState === 'visible' && load(), 15000);
    return () => clearInterval(t);
  }, [load]);

  const back = { href: '/admin/modifications', label: 'All change requests' };

  if (error && !modification) {
    return (
      <div>
        <AdminPageHeader title="Change request" back={back} />
        <ErrorBanner message={error} onRetry={load} />
      </div>
    );
  }

  if (!modification) return <DetailSkeleton back={back} />;

  const client = fullName(modification.user);
  const hasFinal = modification.files.some((f) => f.isFinal);

  return (
    <div>
      <AdminPageHeader
        back={back}
        title={
          <span className="flex flex-wrap items-center gap-3">
            {modification.design.title}
            <StatusBadge status={modification.status} />
          </span>
        }
        description={
          <>
            Request #{modification.id.slice(0, 8)} · {client} · opened {new Date(modification.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
          </>
        }
        actions={
          <Link
            href={`/admin/messages?id=${modification.id}`}
            className="inline-flex h-10 items-center gap-1.5 rounded-pill bg-white/10 px-4 text-[12.5px] text-white transition-colors hover:bg-white/15"
          >
            <MessagesSquare size={14} /> Open in Messages
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <Panel>
            <PanelHeader title="Progress" description="What the client sees on their tracking page." />
            <ProgressControl modificationId={modification.id} status={modification.status} hasFinalFiles={hasFinal} onChanged={load} />
          </Panel>

          <Panel delay={0.05} className="flex h-[560px] flex-col">
            <PanelHeader
              title={`Conversation with ${client}`}
              count={modification.events.filter((e) => e.kind === 'COMMENT').length}
              description="Replies notify the client by email and in their dashboard."
            />
            <Conversation modification={modification} onUpdated={setModification} className="flex-1" />
          </Panel>
        </div>

        <div className="flex flex-col gap-5">
          <Panel delay={0.08}>
            <PanelHeader title="Client" />
            <div className="flex items-center gap-3 px-5 py-4">
              <Avatar name={client} size={40} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-medium text-ink-900">{client}</div>
                <div className="truncate text-[11.5px] text-ink-500">{modification.user?.email}</div>
              </div>
              {modification.user?.email && (
                <a
                  href={`mailto:${modification.user.email}`}
                  aria-label={`Email ${client}`}
                  title="Email client"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-panel-200 hover:text-ink-900"
                >
                  <Mail size={14} />
                </a>
              )}
            </div>
          </Panel>

          <Panel delay={0.1}>
            <PanelHeader title="Requested changes" count={modification.selectedOptions.length} />
            <ul className="divide-y divide-panel-300">
              {modification.selectedOptions.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 px-5 py-2.5 text-[12.5px]">
                  <span className="text-ink-900">{s.option.label}</span>
                  <span className="text-ink-700">{formatCents(s.priceAtSelectionCents)}</span>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between border-t border-panel-300 bg-panel-200/50 px-5 py-3 text-[12.5px]">
              <span className="text-ink-700">{modification.paidAt ? `Paid ${new Date(modification.paidAt).toLocaleDateString()}` : 'Total'}</span>
              <span className="font-medium text-ink-900">{formatCents(modification.totalAmountCents)}</span>
            </div>
          </Panel>

          <FilesPanel modification={modification} onChanged={load} />

          <Panel delay={0.14}>
            <PanelHeader title="Design" />
            <div className="flex items-center gap-3 px-5 py-4">
              <div className="h-12 w-16 flex-none overflow-hidden rounded-control bg-panel-200">
                <img src={modification.design.coverImageUrl} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12.5px] font-medium text-ink-900">{modification.design.title}</div>
                <div className="text-[11px] text-ink-500">Base plan {formatCents(modification.design.basePriceCents)}</div>
              </div>
              <Link
                href={`/designs/${modification.design.slug}`}
                target="_blank"
                title="View in store"
                aria-label="View design in store"
                className="flex h-8 w-8 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-panel-200 hover:text-ink-900"
              >
                <ExternalLink size={13} />
              </Link>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function FilesPanel({ modification, onChanged }: { modification: Modification; onChanged: () => Promise<void> }) {
  const [label, setLabel] = useState('');
  const [isFinal, setIsFinal] = useState(modification.status === 'DELIVERED' || modification.status === 'IN_PROGRESS');
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ModificationFile | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const signature = await apiFetch<UploadSignature>(`/api/admin/modifications/${modification.id}/upload-signature`, { method: 'POST' });
      const result = await uploadToCloudinary(file, signature);
      await apiFetch(`/api/admin/modifications/${modification.id}/files`, {
        method: 'POST',
        body: { label: label.trim() || file.name, cloudinaryPublicId: result.public_id, resourceType: result.resource_type, format: result.format, isFinal },
      });
      setLabel('');
      toast.success(isFinal ? 'Final file uploaded' : 'File shared with the client');
      await onChanged();
    } catch (err) {
      toast.error('Upload failed', { description: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setUploading(false);
    }
  }

  async function download(fileId: string) {
    setDownloadingId(fileId);
    try {
      const { url } = await apiFetch<{ url: string }>(`/api/modifications/${modification.id}/files/${fileId}/download`);
      window.open(url, '_blank', 'noopener');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not open the file.');
    } finally {
      setDownloadingId(null);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/admin/modifications/${modification.id}/files/${pendingDelete.id}`, { method: 'DELETE' });
      toast.success('File removed');
      setPendingDelete(null);
      await onChanged();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not remove the file.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Panel delay={0.12}>
      <PanelHeader title="Files" count={modification.files.length} description="Shared on the client's tracking page." />
      {modification.files.length > 0 && (
        <ul className="divide-y divide-panel-300">
          {modification.files.map((f) => (
            <li key={f.id} className="flex items-center gap-2.5 px-5 py-2.5">
              <FileText size={14} className="flex-none text-ink-500" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12px] text-ink-900">{f.label}</div>
                <div className="text-[10.5px] uppercase tracking-wide text-ink-500">{f.format}</div>
              </div>
              {f.isFinal && <Pill tone="green">Final</Pill>}
              <button
                onClick={() => download(f.id)}
                disabled={downloadingId === f.id}
                aria-label={`Download ${f.label}`}
                className="flex h-7 w-7 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-panel-200 hover:text-ink-900 disabled:opacity-50"
              >
                {downloadingId === f.id ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Download size={13} />}
              </button>
              <button
                onClick={() => setPendingDelete(f)}
                aria-label={`Remove ${f.label}`}
                className="flex h-7 w-7 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="space-y-2.5 border-t border-panel-300 px-5 py-4">
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label (optional)" className={`${adminInput} h-9`} />
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-[11.5px] text-ink-700">
            <Toggle checked={isFinal} onChange={() => setIsFinal((v) => !v)} label="Mark as final delivery" />
            Final delivery file
          </span>
          <label
            className={`inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-pill bg-ink-950 px-4 text-[12px] font-medium text-white transition-colors hover:bg-black ${
              uploading ? 'pointer-events-none opacity-60' : ''
            }`}
          >
            {uploading ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <UploadCloud size={13} />}
            {uploading ? 'Uploading…' : 'Upload'}
            <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Remove this file?"
        body={`"${pendingDelete?.label}" will disappear from the client's tracking page.`}
        confirmLabel="Remove"
        danger
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </Panel>
  );
}

function DetailSkeleton({ back }: { back: { href: string; label: string } }) {
  return (
    <div>
      <AdminPageHeader back={back} title={<Skeleton className="h-6 w-64 bg-white/10" />} description={<Skeleton className="mt-2 h-3 w-80 bg-white/10" />} />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <Panel className="p-5">
            <Skeleton className="h-3 w-24" />
            <div className="mt-6 grid grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-2.5 w-14" />
                </div>
              ))}
            </div>
            <Skeleton className="mt-6 h-14 w-full" />
          </Panel>
          <Panel className="h-[420px] p-5">
            <Skeleton className="h-3 w-40" />
            <div className="mt-6 space-y-4">
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="ml-auto h-10 w-1/2" />
              <Skeleton className="h-10 w-3/5" />
            </div>
          </Panel>
        </div>
        <div className="flex flex-col gap-5">
          {[0, 1, 2].map((i) => (
            <Panel key={i} className="p-5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-4 h-10 w-full" />
            </Panel>
          ))}
        </div>
      </div>
    </div>
  );
}
