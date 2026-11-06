'use client';

import { useCallback, useEffect, useRef, useState, FormEvent } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CalendarClock, Download, ExternalLink, FileText, Send } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch, ApiError } from '@/lib/client/api';
import { Modification, ModificationEvent, ModificationStatus } from '@/lib/types/modification';
import { formatCents } from '@/lib/client/format';
import { StatusPipeline } from '@/components/modifications/status-pipeline';
import { BookMeetingForm } from '@/components/meetings/book-meeting-form';
import { Modal, ModalCloseButton } from '@/components/ui/modal';
import { SafeImage as Image } from '@/components/ui/safe-image';
import { fallbackImageFor } from '@/lib/stock-images';
import { withFrom } from '@/lib/back-link';

const POLL_MS = 15000;

export const STATUS_LABEL: Record<ModificationStatus, string> = {
  SUBMITTED: 'Submitted',
  IN_REVIEW: 'In review',
  IN_PROGRESS: 'In progress',
  REVISION: 'Revision',
  DELIVERED: 'Delivered',
};

const STATUS_HINT: Record<ModificationStatus, string> = {
  SUBMITTED: 'We have your request and payment. The architect will review it shortly.',
  IN_REVIEW: 'The architect is reviewing your requested changes.',
  IN_PROGRESS: 'Your plan is being updated.',
  REVISION: 'A revision is underway — see the latest message below.',
  DELIVERED: 'Your updated plan is ready. Download the files below.',
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

function DownloadFileButton({ modificationId, fileId, label, isFinal }: { modificationId: string; fileId: string; label: string; isFinal: boolean }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const { url } = await apiFetch<{ url: string }>(`/api/modifications/${modificationId}/files/${fileId}/download`);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      toast.error('Could not start the download', {
        id: `dl-${fileId}`,
        description: err instanceof ApiError ? err.message : 'Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-2 rounded-control border border-warm-300 bg-white px-3 py-2 text-[12px] text-ink-900 transition-colors hover:border-ink-900 disabled:opacity-50"
    >
      {isFinal ? <Download size={13} /> : <FileText size={13} />}
      {loading ? 'Preparing…' : label}
      {isFinal && <span className="rounded-pill bg-ink-900 px-1.5 py-0.5 text-[9px] text-white">FINAL</span>}
    </button>
  );
}

function ActivityItem({ event }: { event: ModificationEvent }) {
  if (event.kind === 'STATUS_CHANGE') {
    return (
      <div className="flex flex-col items-center gap-0.5 py-1.5 text-center text-[10.5px] text-ink-500">
        <span className="rounded-pill bg-warm-100 px-2.5 py-0.5">
          {event.toStatus ? `Moved to ${STATUS_LABEL[event.toStatus]}` : 'Status updated'} · {timeAgo(event.createdAt)}
        </span>
        {event.comment && <span className="max-w-[90%] italic text-ink-700">“{event.comment}”</span>}
      </div>
    );
  }

  const fromArchitect = event.author?.role === 'ADMIN';
  return (
    <div className={`flex max-w-[85%] flex-col gap-0.5 ${fromArchitect ? 'self-start' : 'self-end'}`}>
      <div
        className={`whitespace-pre-wrap break-words rounded-card-sm px-3.5 py-2 text-[12.5px] ${
          fromArchitect ? 'rounded-bl-md bg-warm-100 text-ink-900' : 'rounded-br-md bg-ink-900 text-white'
        }`}
      >
        {event.comment}
      </div>
      <span className={`text-[9.5px] text-ink-500 ${fromArchitect ? '' : 'text-right'}`}>
        {fromArchitect ? 'Architect' : 'You'} · {timeAgo(event.createdAt)}
      </span>
    </div>
  );
}

export function TrackingView({ modificationId }: { modificationId: string }) {
  const reduce = useReducedMotion();
  const [modification, setModification] = useState<Modification | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const activityRef = useRef<HTMLDivElement>(null);
  const lastEventCount = useRef(0);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<Modification>(`/api/modifications/${modificationId}`);
      setModification(data);
      setLoadError(null);
    } catch (err) {
      // A failed background refresh must never wipe out what's already on screen.
      setModification((current) => {
        if (current === null) setLoadError(err instanceof ApiError ? err.message : 'Could not load this request.');
        return current;
      });
    }
  }, [modificationId]);

  useEffect(() => {
    load();
  }, [load]);

  const delivered = modification?.status === 'DELIVERED';
  useEffect(() => {
    if (!modification || delivered) return;
    const id = window.setInterval(() => document.visibilityState === 'visible' && load(), POLL_MS);
    const onVisible = () => document.visibilityState === 'visible' && load();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [modification, delivered, load]);

  const eventCount = modification?.events.length ?? 0;
  useEffect(() => {
    const el = activityRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: lastEventCount.current ? 'smooth' : 'auto' });
    if (lastEventCount.current && eventCount > lastEventCount.current && modification) {
      const latest = modification.events[modification.events.length - 1];
      if (latest.author?.role === 'ADMIN' || latest.kind === 'STATUS_CHANGE') {
        toast('Update on your request', {
          id: `mod-update-${latest.id}`,
          description:
            latest.kind === 'STATUS_CHANGE' && latest.toStatus
              ? `Now ${STATUS_LABEL[latest.toStatus].toLowerCase()}`
              : 'The architect sent you a message.',
        });
      }
    }
    lastEventCount.current = eventCount;
  }, [eventCount, modification]);

  async function handleComment(event: FormEvent) {
    event.preventDefault();
    const text = comment.trim();
    if (!text || posting) return;
    setPosting(true);
    try {
      await apiFetch(`/api/modifications/${modificationId}/comments`, { method: 'POST', body: { comment: text } });
      setComment('');
      await load();
    } catch (err) {
      toast.error('Message not sent', {
        id: 'comment-error',
        description: err instanceof ApiError ? err.message : 'Please check your connection and try again.',
      });
    } finally {
      setPosting(false);
    }
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-md rounded-card-lg bg-white p-8 text-center">
        <p className="text-[13px] text-red-600">{loadError}</p>
        <button
          onClick={() => {
            setLoadError(null);
            load();
          }}
          className="mt-4 rounded-pill bg-ink-900 px-5 py-2.5 text-[12px] font-medium text-white transition-colors hover:bg-ink-950"
        >
          Try again
        </button>
      </div>
    );
  }
  if (!modification) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-24 animate-pulse rounded-card-lg bg-warm-150" />
        <div className="h-28 animate-pulse rounded-card-lg bg-warm-150" />
        <div className="h-64 animate-pulse rounded-card-lg bg-warm-150" />
      </div>
    );
  }

  const hasMessages = modification.events.some((e) => e.kind === 'COMMENT');
  const finalFiles = modification.files.filter((f) => f.isFinal);
  const section = (i: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay: reduce ? 0 : i * 0.06, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <motion.div {...section(0)} className="flex flex-wrap items-center gap-4 rounded-card-lg bg-white p-5">
        <div className="relative h-16 w-24 flex-none overflow-hidden rounded-control bg-warm-100">
          <Image
            src={modification.design.coverImageUrl}
            fallbackSrc={fallbackImageFor(modification.design.slug)}
            alt={modification.design.title}
            fill
            sizes="96px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[19px] font-medium text-ink-900">{modification.design.title}</h1>
          <p className="mt-0.5 text-[11.5px] text-ink-500">
            Request #{modification.id.slice(0, 8)} · {formatCents(modification.totalAmountCents)} paid
            {!delivered && <span className="ml-1.5 text-ink-500/70">· updates automatically</span>}
          </p>
        </div>
        <span
          className={`rounded-pill px-3 py-1.5 text-[11px] font-medium ${
            delivered ? 'bg-ink-900 text-white' : 'bg-warm-100 text-ink-900'
          }`}
        >
          {STATUS_LABEL[modification.status]}
        </span>
      </motion.div>

      {/* Progress */}
      <motion.div {...section(1)} className="rounded-card-lg bg-white px-5 py-6 sm:px-8">
        <StatusPipeline status={modification.status} />
        <p className="mt-5 text-center text-[12.5px] text-ink-700">{STATUS_HINT[modification.status]}</p>
        {delivered && finalFiles.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {finalFiles.map((f) => (
              <DownloadFileButton key={f.id} modificationId={modification.id} fileId={f.id} label={f.label} isFinal />
            ))}
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.25fr]">
        {/* Details */}
        <motion.div {...section(2)} className="flex flex-col gap-4">
          <div className="rounded-card-lg bg-white p-5">
            <div className="text-[10px] tracking-[0.12em] text-ink-500">SELECTED CHANGES</div>
            <ul className="mt-3 flex flex-col divide-y divide-warm-150">
              {modification.selectedOptions.map((s) => (
                <li key={s.id} className="flex justify-between py-2 text-[12.5px] text-ink-700">
                  <span>{s.option.label}</span>
                  <span className="text-ink-900">{formatCents(s.priceAtSelectionCents)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-card-lg bg-white p-5">
            <div className="text-[10px] tracking-[0.12em] text-ink-500">FILES FROM THE ARCHITECT</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {modification.files.length === 0 && (
                <p className="text-[12px] text-ink-500">No files yet — they&apos;ll appear here as soon as they&apos;re uploaded.</p>
              )}
              {modification.files.map((file) => (
                <DownloadFileButton key={file.id} modificationId={modification.id} fileId={file.id} label={file.label} isFinal={file.isFinal} />
              ))}
            </div>
          </div>

          <div className="rounded-card-lg bg-white p-5">
            <div className="text-[10px] tracking-[0.12em] text-ink-500">NEED TO TALK IT THROUGH?</div>
            <p className="mt-2 text-[12px] text-ink-700">Book a short call with the architect about this request.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => setShowBooking(true)}
                className="flex items-center gap-2 rounded-pill border border-ink-900 px-4 py-2 text-[12px] text-ink-900 transition-colors hover:bg-warm-100"
              >
                <CalendarClock size={14} /> Book a meeting
              </button>
              <Link
                href={withFrom(`/designs/${modification.design.slug}`, `/dashboard/requests/${modification.id}`)}
                className="flex items-center gap-1.5 rounded-pill px-4 py-2 text-[12px] text-ink-700 transition-colors hover:bg-warm-100"
              >
                View plan <ExternalLink size={12} />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Messages */}
        <motion.div {...section(3)} className="flex min-h-[420px] flex-col rounded-card-lg bg-white p-5">
          <div className="text-[10px] tracking-[0.12em] text-ink-500">ACTIVITY &amp; MESSAGES</div>
          <div ref={activityRef} className="mt-3 flex max-h-[440px] flex-1 flex-col gap-2 overflow-y-auto pr-1">
            {!hasMessages && (
              <p className="py-2 text-center text-[12px] text-ink-500">No messages yet — ask the architect anything.</p>
            )}
            <AnimatePresence initial={false}>
              {modification.events.map((e) => (
                <motion.div
                  key={e.id}
                  layout={!reduce}
                  initial={{ opacity: 0, y: reduce ? 0 : 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col"
                >
                  <ActivityItem event={e} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <form onSubmit={handleComment} noValidate className="mt-3 flex gap-2 border-t border-warm-150 pt-3">
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a message to the architect…"
              maxLength={2000}
              aria-label="Message to the architect"
              className="h-10 flex-1 rounded-pill bg-warm-100 px-4 text-[12.5px] outline-none placeholder:text-ink-500/60 focus:ring-2 focus:ring-ink-900/15"
            />
            <button
              type="submit"
              disabled={posting || !comment.trim()}
              aria-label="Send message"
              className="flex h-10 items-center gap-1.5 rounded-pill bg-ink-900 px-4 text-[12px] font-medium text-white transition-colors hover:bg-ink-950 disabled:opacity-50"
            >
              <Send size={13} /> {posting ? 'Sending…' : 'Send'}
            </button>
          </form>
        </motion.div>
      </div>

      <Modal open={showBooking} onClose={() => setShowBooking(false)} className="w-[94vw] max-w-md" labelledBy="book-title">
        <div className="flex items-center justify-between border-b border-warm-200 px-6 py-4">
          <h2 id="book-title" className="text-[16px] font-medium text-ink-900">Book a meeting</h2>
          <ModalCloseButton onClose={() => setShowBooking(false)} />
        </div>
        <div className="p-6">
          <BookMeetingForm modificationId={modification.id} />
        </div>
      </Modal>
    </div>
  );
}
