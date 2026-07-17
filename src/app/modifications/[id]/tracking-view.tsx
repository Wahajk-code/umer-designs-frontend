'use client';

import { useEffect, useState, FormEvent } from 'react';
import { apiFetch, ApiError } from '@/lib/client/api';
import { Modification } from '@/lib/types/modification';
import { formatCents } from '@/lib/client/format';
import { StatusPipeline } from '@/components/modifications/status-pipeline';
import { Button } from '@/components/ui/button';
import { BookMeetingForm } from '@/components/meetings/book-meeting-form';
import { WhiteboardCanvas } from '@/components/whiteboard/whiteboard-canvas';

function DownloadFileButton({ modificationId, fileId, label }: { modificationId: string; fileId: string; label: string }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const { url } = await apiFetch<{ url: string }>(
        `/api/modifications/${modificationId}/files/${fileId}/download`,
      );
      window.open(url, '_blank', 'noopener,noreferrer');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="rounded-control bg-warm-150 px-2.5 py-1.5 text-[10px] text-ink-900 disabled:opacity-50"
    >
      {loading ? '…' : `${label} ↓`}
    </button>
  );
}

export function TrackingView({ modificationId }: { modificationId: string }) {
  const [modification, setModification] = useState<Modification | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);

  async function load() {
    try {
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

  async function handleComment(event: FormEvent) {
    event.preventDefault();
    if (!comment.trim()) return;
    setPosting(true);
    try {
      await apiFetch(`/api/modifications/${modificationId}/comments`, {
        method: 'POST',
        body: { comment },
      });
      setComment('');
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not post comment.');
    } finally {
      setPosting(false);
    }
  }

  if (error) return <p className="text-[13px] text-red-600">{error}</p>;
  if (!modification) return <div className="h-64 animate-pulse rounded-card bg-warm-150" />;

  const comments = modification.events.filter((e) => e.kind === 'COMMENT');

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-[20px] font-medium text-ink-900">{modification.design.title}</h1>
        <span className="text-[13px] text-ink-900">{formatCents(modification.totalAmountCents)}</span>
      </div>
      <p className="text-[11px] text-ink-500">Request #{modification.id.slice(0, 8)}</p>

      <div className="mt-5 rounded-card-lg bg-white p-5">
        <StatusPipeline status={modification.status} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-card-lg bg-white p-5">
          <div className="text-[10px] tracking-[0.12em] text-ink-500">FILES</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {modification.files.length === 0 && (
              <p className="text-[12px] text-ink-500">No files shared yet.</p>
            )}
            {modification.files.map((file) => (
              <DownloadFileButton
                key={file.id}
                modificationId={modification.id}
                fileId={file.id}
                label={file.label}
              />
            ))}
          </div>

          <div className="mt-5 text-[10px] tracking-[0.12em] text-ink-500">SELECTED CHANGES</div>
          <ul className="mt-2 flex flex-col gap-1.5">
            {modification.selectedOptions.map((s) => (
              <li key={s.id} className="flex justify-between text-[12px] text-ink-700">
                <span>{s.option.label}</span>
                <span>+{formatCents(s.priceAtSelectionCents)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-card-lg bg-white p-5">
          <div className="text-[10px] tracking-[0.12em] text-ink-500">COMMENTS</div>
          <div className="mt-3 flex max-h-72 flex-col gap-2 overflow-y-auto">
            {comments.length === 0 && <p className="text-[12px] text-ink-500">No comments yet.</p>}
            {comments.map((c) => (
              <div
                key={c.id}
                className={`rounded-card-sm px-3 py-2 text-[12px] ${
                  c.author?.role === 'ADMIN' ? 'self-start bg-warm-100 text-ink-900' : 'self-end bg-ink-900 text-white'
                } max-w-[85%]`}
              >
                {c.comment}
              </div>
            ))}
          </div>
          <form onSubmit={handleComment} className="mt-3 flex gap-2">
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Message…"
              className="h-9 flex-1 rounded-pill bg-warm-100 px-3 text-[12px] outline-none placeholder:text-ink-500/60"
            />
            <Button type="submit" disabled={posting || !comment.trim()} className="!px-4 !py-2 text-[11px]">
              Send
            </Button>
          </form>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          onClick={() => setShowBooking((v) => !v)}
          className="rounded-pill border border-ink-900 px-5 py-2.5 text-[12px] text-ink-900 transition-colors hover:bg-warm-100"
        >
          Book meeting
        </button>
        <button
          onClick={() => setShowWhiteboard((v) => !v)}
          className="rounded-pill border border-ink-900 px-5 py-2.5 text-[12px] text-ink-900 transition-colors hover:bg-warm-100"
        >
          Whiteboard ✎
        </button>
      </div>

      {showBooking && (
        <div className="mt-4 max-w-sm rounded-card-lg bg-white p-5">
          <BookMeetingForm modificationId={modification.id} onBooked={() => setShowBooking(false)} />
        </div>
      )}

      {showWhiteboard && (
        <div className="mt-4 max-w-2xl">
          <WhiteboardCanvas modificationId={modification.id} onClose={() => setShowWhiteboard(false)} />
        </div>
      )}
    </div>
  );
}
