'use client';

import { useEffect, useState } from 'react';
import { apiFetch, ApiError } from '@/lib/client/api';
import { Meeting } from '@/lib/types/meeting';

export function AdminMeetingsView() {
  const [meetings, setMeetings] = useState<Meeting[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [linkDrafts, setLinkDrafts] = useState<Record<string, string>>({});

  async function load() {
    try {
      const data = await apiFetch<{ meetings: Meeting[] }>('/api/admin/meetings');
      setMeetings(data.meetings);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load meetings.');
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount pattern
    load();
  }, []);

  async function handleConfirm(id: string) {
    const link = linkDrafts[id];
    if (!link) return;
    await apiFetch(`/api/admin/meetings/${id}/confirm`, { method: 'PATCH', body: { link } });
    load();
  }

  async function handleCancel(id: string) {
    await apiFetch(`/api/admin/meetings/${id}/cancel`, { method: 'PATCH' });
    load();
  }

  if (error) return <p className="text-[12px] text-red-400">{error}</p>;

  return (
    <div className="overflow-hidden rounded-lg bg-white">
      {!meetings && <p className="p-4 text-[12px] text-dark-500">Loading…</p>}
      {meetings?.map((meeting, i) => (
        <div key={meeting.id} className={`p-4 ${i < meetings.length - 1 ? 'border-b border-warm-150' : ''}`}>
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-ink-900">
              {new Date(meeting.scheduledAt).toLocaleString()}
              {meeting.notes ? ` — ${meeting.notes}` : ''}
            </span>
            <span className="bg-ink-950 px-2 py-1 text-[9.5px] text-white">{meeting.status}</span>
          </div>
          {meeting.status === 'REQUESTED' && (
            <div className="mt-2 flex gap-2">
              <input
                placeholder="Meeting link (Zoom/Meet URL)"
                value={linkDrafts[meeting.id] ?? ''}
                onChange={(e) => setLinkDrafts((prev) => ({ ...prev, [meeting.id]: e.target.value }))}
                className="h-8 flex-1 border border-warm-400 px-2 text-[11px] outline-none"
              />
              <button
                onClick={() => handleConfirm(meeting.id)}
                className="bg-ink-950 px-3 text-[10.5px] text-white"
              >
                Confirm
              </button>
              <button onClick={() => handleCancel(meeting.id)} className="text-[10.5px] text-red-600 underline">
                Cancel
              </button>
            </div>
          )}
          {meeting.status === 'CONFIRMED' && meeting.link && (
            <a href={meeting.link} className="mt-1 inline-block text-[11px] text-ink-500 underline">
              {meeting.link}
            </a>
          )}
        </div>
      ))}
      {meetings?.length === 0 && <p className="p-4 text-[12px] text-dark-500">No meetings yet.</p>}
    </div>
  );
}
