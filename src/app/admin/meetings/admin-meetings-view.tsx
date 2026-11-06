'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { toast } from 'sonner';
import { CalendarClock, CalendarX2, Check, Copy, ExternalLink, Video } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/client/api';
import { Meeting } from '@/lib/types/meeting';
import { cn } from '@/lib/client/cn';
import {
  AdminButton,
  AdminPageHeader,
  Avatar,
  ConfirmDialog,
  EmptyState,
  ErrorBanner,
  Field,
  FilterTabs,
  ListSkeleton,
  Panel,
  Pill,
  adminInput,
  fullName,
} from '@/components/admin/admin-ui';

interface AdminMeeting extends Meeting {
  user?: { email: string; firstName: string; lastName: string };
  modification?: { id: string; design: { title: string } } | null;
}

type Tab = 'requests' | 'upcoming' | 'past';

function relative(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  const days = Math.round(diff / 86400000);
  const hours = Math.round(diff / 3600000);
  if (Math.abs(hours) < 24) return hours >= 0 ? `in ${Math.max(hours, 0)}h` : `${-hours}h ago`;
  return days >= 0 ? `in ${days} day${days === 1 ? '' : 's'}` : `${-days} day${days === -1 ? '' : 's'} ago`;
}

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function AdminMeetingsView() {
  const [meetings, setMeetings] = useState<AdminMeeting[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('requests');
  const [confirming, setConfirming] = useState<AdminMeeting | null>(null);
  const [cancelling, setCancelling] = useState<AdminMeeting | null>(null);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(0);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<{ meetings: AdminMeeting[] }>('/api/admin/meetings?pageSize=100');
      setMeetings(data.meetings);
      setNow(Date.now());
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load meetings.');
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount pattern
    load();
  }, [load]);

  const groups = useMemo(() => {
    const all = meetings ?? [];
    return {
      requests: all.filter((m) => m.status === 'REQUESTED').sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt)),
      upcoming: all
        .filter((m) => m.status === 'CONFIRMED' && new Date(m.scheduledAt).getTime() >= now - 3600000)
        .sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt)),
      past: all
        .filter((m) => m.status === 'CANCELLED' || m.status === 'COMPLETED' || (m.status === 'CONFIRMED' && new Date(m.scheduledAt).getTime() < now - 3600000))
        .sort((a, b) => +new Date(b.scheduledAt) - +new Date(a.scheduledAt)),
    };
  }, [meetings, now]);

  async function doCancel() {
    if (!cancelling) return;
    setBusy(true);
    try {
      await apiFetch(`/api/admin/meetings/${cancelling.id}/cancel`, { method: 'PATCH' });
      toast.success('Meeting cancelled', { description: `${fullName(cancelling.user)} has been emailed.` });
      setCancelling(null);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not cancel the meeting.');
    } finally {
      setBusy(false);
    }
  }

  const list = groups[tab];

  return (
    <div>
      <AdminPageHeader title="Meetings" description="Confirm client call requests with a video link — or propose another time. Clients are emailed every change." />

      <FilterTabs<Tab>
        className="mb-4"
        value={tab}
        onChange={setTab}
        options={[
          { label: 'Requests', value: 'requests', count: groups.requests.length },
          { label: 'Upcoming', value: 'upcoming', count: groups.upcoming.length },
          { label: 'Past & cancelled', value: 'past', count: groups.past.length },
        ]}
      />

      {error && <ErrorBanner message={error} onRetry={load} className="mb-4" />}

      <Panel>
        {!meetings && !error ? (
          <ListSkeleton rows={4} />
        ) : list.length === 0 ? (
          <EmptyState
            icon={<CalendarClock size={18} />}
            title={tab === 'requests' ? 'No pending requests' : tab === 'upcoming' ? 'Nothing scheduled' : 'No past meetings'}
            hint={tab === 'requests' ? 'New meeting requests from clients will show up here.' : undefined}
          />
        ) : (
          <ul className="divide-y divide-panel-300">
            <AnimatePresence initial={false}>
              {list.map((m, i) => (
                <MeetingRow key={m.id} meeting={m} index={i} now={now} onConfirm={() => setConfirming(m)} onCancel={() => setCancelling(m)} />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </Panel>

      <ConfirmMeetingModal meeting={confirming} onClose={() => setConfirming(null)} onDone={load} />

      <ConfirmDialog
        open={!!cancelling}
        title={cancelling?.status === 'REQUESTED' ? 'Decline this request?' : 'Cancel this meeting?'}
        body={`${fullName(cancelling?.user)} will be emailed that the meeting is cancelled and invited to book another time.`}
        confirmLabel={cancelling?.status === 'REQUESTED' ? 'Decline' : 'Cancel meeting'}
        danger
        loading={busy}
        onConfirm={doCancel}
        onClose={() => setCancelling(null)}
      />
    </div>
  );
}

function MeetingRow({ meeting: m, index, now, onConfirm, onCancel }: { meeting: AdminMeeting; index: number; now: number; onConfirm: () => void; onCancel: () => void }) {
  const reduce = useReducedMotion();
  const d = new Date(m.scheduledAt);
  const name = fullName(m.user);
  const muted = m.status === 'CANCELLED' || m.status === 'COMPLETED';

  async function copy() {
    if (!m.link) return;
    await navigator.clipboard.writeText(m.link).catch(() => undefined);
    toast.success('Meeting link copied');
  }

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: reduce ? 0 : 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ delay: reduce ? 0 : Math.min(index, 10) * 0.03 }}
      className={cn('flex flex-wrap items-center gap-4 px-5 py-4 transition-colors hover:bg-panel-200/40', muted && 'opacity-70')}
    >
      <div className="flex h-14 w-14 flex-none flex-col items-center justify-center rounded-card-sm bg-white ring-1 ring-panel-300">
        <span className="text-[9.5px] font-medium uppercase tracking-wide text-red-600">{d.toLocaleDateString(undefined, { month: 'short' })}</span>
        <span className="text-[19px] font-light leading-none text-ink-900">{d.getDate()}</span>
        <span className="text-[9px] text-ink-500">{d.toLocaleDateString(undefined, { weekday: 'short' })}</span>
      </div>

      <div className="min-w-[160px]">
        <div className="text-[13px] font-medium text-ink-900">{d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</div>
        <div className="text-[11px] text-ink-500">{relative(m.scheduledAt)}</div>
      </div>

      <div className="flex min-w-[200px] flex-1 items-center gap-2.5">
        <Avatar name={name} size={32} />
        <div className="min-w-0">
          <div className="truncate text-[12.5px] text-ink-900">{name}</div>
          <div className="truncate text-[11px] text-ink-500">
            {m.user?.email}
            {m.modification && (
              <>
                {' · '}
                <Link href={`/admin/modifications/${m.modification.id}`} className="underline-offset-2 hover:text-ink-900 hover:underline">
                  {m.modification.design.title}
                </Link>
              </>
            )}
          </div>
          {m.notes && <div className="mt-1 line-clamp-2 max-w-md text-[11.5px] italic text-ink-700">“{m.notes}”</div>}
        </div>
      </div>

      <div className="ml-auto flex flex-wrap items-center gap-2">
        {m.status === 'REQUESTED' && (
          <>
            <AdminButton size="sm" variant="ghost" onClick={onCancel}>
              Decline
            </AdminButton>
            <AdminButton size="sm" icon={<Check size={13} />} onClick={onConfirm}>
              Confirm
            </AdminButton>
          </>
        )}
        {m.status === 'CONFIRMED' && (
          <>
            {m.link && (
              <>
                <button
                  onClick={copy}
                  aria-label="Copy meeting link"
                  title="Copy link"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-panel-200 hover:text-ink-900"
                >
                  <Copy size={13} />
                </button>
                <a
                  href={m.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-8 items-center gap-1.5 rounded-pill bg-ink-950 px-3.5 text-[11.5px] font-medium text-white transition-colors hover:bg-black"
                >
                  <Video size={13} /> Join <ExternalLink size={10} />
                </a>
              </>
            )}
            {!muted && new Date(m.scheduledAt).getTime() > now && (
              <AdminButton size="sm" variant="ghost" icon={<CalendarX2 size={13} />} onClick={onCancel}>
                Cancel
              </AdminButton>
            )}
          </>
        )}
        {m.status === 'REQUESTED' ? (
          <Pill tone="amber">Requested</Pill>
        ) : m.status === 'CONFIRMED' ? (
          <Pill tone="green">Confirmed</Pill>
        ) : (
          <Pill>{m.status === 'CANCELLED' ? 'Cancelled' : 'Completed'}</Pill>
        )}
      </div>
    </motion.li>
  );
}

function ConfirmMeetingModal({ meeting, onClose, onDone }: { meeting: AdminMeeting | null; onClose: () => void; onDone: () => Promise<void> }) {
  const [link, setLink] = useState('');
  const [when, setWhen] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!meeting) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset the form for the meeting being confirmed
    setLink('');
    setWhen(toLocalInput(meeting.scheduledAt));
    setErr(null);
  }, [meeting]);

  async function submit() {
    if (!meeting) return;
    if (!/^https?:\/\/\S+\.\S+/.test(link.trim())) {
      setErr('Paste the full video link, e.g. https://meet.google.com/abc-defg-hij');
      return;
    }
    const changed = when && new Date(when).getTime() !== new Date(meeting.scheduledAt).getTime();
    if (changed && new Date(when).getTime() < Date.now()) {
      setErr('Pick a time in the future.');
      return;
    }
    setSaving(true);
    try {
      await apiFetch(`/api/admin/meetings/${meeting.id}/confirm`, {
        method: 'PATCH',
        body: { link: link.trim(), ...(changed && { scheduledAt: new Date(when).toISOString() }) },
      });
      toast.success('Meeting confirmed', { description: `${fullName(meeting.user)} has the link by email.` });
      onClose();
      await onDone();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Could not confirm the meeting.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ConfirmDialog
      open={!!meeting}
      title="Confirm meeting"
      body={
        meeting && (
          <>
            With <b className="font-medium text-ink-900">{fullName(meeting.user)}</b> · requested for{' '}
            {new Date(meeting.scheduledAt).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </>
        )
      }
      confirmLabel="Confirm & email client"
      loading={saving}
      onConfirm={submit}
      onClose={onClose}
    >
      <div className="space-y-3">
        <Field label="Video link" error={err}>
          <input
            autoFocus
            value={link}
            onChange={(e) => {
              setLink(e.target.value);
              setErr(null);
            }}
            placeholder="https://meet.google.com/…"
            className={adminInput}
          />
        </Field>
        <Field label="Time" hint="Change it to propose a different time — the client sees the new one.">
          <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className={adminInput} />
        </Field>
      </div>
    </ConfirmDialog>
  );
}
