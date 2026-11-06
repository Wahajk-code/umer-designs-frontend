'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { toast } from 'sonner';
import { ArrowRightLeft, MessageSquare, Send } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/client/api';
import { Modification, ModificationEvent } from '@/lib/types/modification';
import { cn } from '@/lib/client/cn';
import { Avatar, EmptyState, MOD_STATUS_LABEL, fullName, timeAgo } from '@/components/admin/admin-ui';

function authorName(e: ModificationEvent): string {
  return e.author ? `${e.author.firstName} ${e.author.lastName}`.trim() || (e.author.role === 'ADMIN' ? 'Architect' : 'Client') : 'System';
}

function dayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(Date.now() - 86400000);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
}

/**
 * The architect ↔ client thread for one request, from the admin's side.
 * Client messages sit left, admin replies right, stage changes as chips.
 */
export function Conversation({
  modification,
  onUpdated,
  className,
  showStatusEvents = true,
}: {
  modification: Modification;
  onUpdated: (m: Modification) => void;
  className?: string;
  showStatusEvents?: boolean;
}) {
  const reduce = useReducedMotion();
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const clientName = fullName(modification.user);

  const events = modification.events.filter((e) => e.kind === 'COMMENT' || (showStatusEvents && e.kind === 'STATUS_CHANGE'));
  const messageCount = modification.events.filter((e) => e.kind === 'COMMENT').length;

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduce ? 'auto' : 'smooth' });
  }, [events.length, reduce]);

  async function send(event?: FormEvent) {
    event?.preventDefault();
    const comment = draft.trim();
    if (!comment || sending) return;
    setSending(true);
    try {
      const updated = await apiFetch<Modification>(`/api/modifications/${modification.id}/comments`, {
        method: 'POST',
        body: { comment },
      });
      setDraft('');
      onUpdated(updated);
    } catch (err) {
      toast.error('Message not sent', { description: err instanceof ApiError ? err.message : 'Please try again.' });
    } finally {
      setSending(false);
    }
  }

  const rows = events.map((e, i) => ({
    e,
    day: dayLabel(e.createdAt),
    showDay: i === 0 || dayLabel(events[i - 1].createdAt) !== dayLabel(e.createdAt),
  }));

  return (
    <div className={cn('flex min-h-0 flex-col', className)}>
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {messageCount === 0 && (
          <EmptyState
            icon={<MessageSquare size={18} />}
            title={`No messages with ${clientName} yet`}
            hint="Say hello, ask a question about their site, or share what happens next. They're notified by email and in their dashboard."
            className="py-8"
          />
        )}
        <ul className="flex flex-col gap-2.5">
          <AnimatePresence initial={false}>
            {rows.map(({ e, day, showDay }) => {
              const fromAdmin = e.author?.role === 'ADMIN';
              return (
                <motion.li
                  key={e.id}
                  layout="position"
                  initial={{ opacity: 0, y: reduce ? 0 : 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {showDay && (
                    <div className="my-2 flex items-center gap-3 text-[10px] uppercase tracking-[0.12em] text-ink-500">
                      <span className="h-px flex-1 bg-panel-300" />
                      {day}
                      <span className="h-px flex-1 bg-panel-300" />
                    </div>
                  )}
                  {e.kind === 'STATUS_CHANGE' ? (
                    <div className="flex justify-center">
                      <span className="inline-flex max-w-full items-center gap-1.5 rounded-pill bg-panel-200 px-3 py-1 text-[10.5px] text-ink-700">
                        <ArrowRightLeft size={11} />
                        {e.fromStatus ? `${MOD_STATUS_LABEL[e.fromStatus]} → ` : ''}
                        <b className="font-medium">{e.toStatus ? MOD_STATUS_LABEL[e.toStatus] : ''}</b>
                        {e.comment && <span className="truncate text-ink-500">· “{e.comment}”</span>}
                        <span className="text-ink-500">· {timeAgo(e.createdAt)}</span>
                      </span>
                    </div>
                  ) : (
                    <div className={cn('flex items-end gap-2', fromAdmin && 'flex-row-reverse')}>
                      <Avatar name={authorName(e)} size={26} dark={fromAdmin} />
                      <div className={cn('max-w-[78%]', fromAdmin && 'text-right')}>
                        <div className="mb-0.5 px-1 text-[10.5px] text-ink-500">
                          {fromAdmin ? `${authorName(e)} (you)` : authorName(e)} · {timeAgo(e.createdAt)}
                        </div>
                        <div
                          className={cn(
                            'inline-block whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-left text-[12.5px] leading-relaxed',
                            fromAdmin ? 'rounded-br-md bg-ink-900 text-white' : 'rounded-bl-md bg-white text-ink-900 ring-1 ring-panel-300',
                          )}
                        >
                          {e.comment}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      </div>

      <form onSubmit={send} noValidate className="border-t border-panel-300 bg-panel p-3">
        <div className="flex items-end gap-2 rounded-card-sm bg-panel-100 p-1.5 ring-1 ring-panel-300 focus-within:bg-white focus-within:ring-ink-900">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={Math.min(5, Math.max(1, draft.split('\n').length))}
            maxLength={2000}
            placeholder={`Reply to ${clientName}…`}
            aria-label={`Message ${clientName}`}
            className="max-h-32 min-h-9 flex-1 resize-none bg-transparent px-2.5 py-2 text-[12.5px] leading-relaxed text-ink-900 outline-none placeholder:text-ink-500/70"
          />
          <button
            type="submit"
            disabled={!draft.trim() || sending}
            aria-label="Send message"
            className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-ink-900 text-white transition-all hover:bg-black active:scale-95 disabled:opacity-40"
          >
            {sending ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Send size={14} />}
          </button>
        </div>
        <p className="mt-1.5 px-1 text-[10.5px] text-ink-500">Enter to send · Shift+Enter for a new line · {clientName} gets an email + dashboard notification</p>
      </form>
    </div>
  );
}
