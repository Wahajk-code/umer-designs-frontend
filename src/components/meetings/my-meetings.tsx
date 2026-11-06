'use client';

import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { apiFetch } from '@/lib/client/api';
import { Meeting } from '@/lib/types/meeting';

const STATUS_STYLE: Record<string, string> = {
  REQUESTED: 'bg-warm-100 text-ink-900',
  CONFIRMED: 'bg-ink-900 text-white',
  CANCELLED: 'bg-warm-100 text-ink-500 line-through',
  COMPLETED: 'bg-warm-100 text-ink-500',
};

/** The customer's own meetings, so a booking is never a black box. */
export function MyMeetings() {
  const [meetings, setMeetings] = useState<Meeting[] | null>(null);

  useEffect(() => {
    apiFetch<Meeting[]>('/api/meetings').then(setMeetings).catch(() => setMeetings([]));
  }, []);

  if (!meetings || meetings.length === 0) return null;

  return (
    <div className="mt-6 rounded-card-lg bg-white p-6">
      <div className="text-[10px] tracking-[0.12em] text-ink-500">YOUR MEETINGS</div>
      <ul className="mt-3 flex flex-col divide-y divide-warm-150">
        {meetings.map((m) => (
          <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
            <div>
              <div className="text-[13px] text-ink-900">
                {new Date(m.scheduledAt).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </div>
              {m.notes && <div className="line-clamp-1 text-[11.5px] text-ink-500">{m.notes}</div>}
            </div>
            <div className="flex items-center gap-2">
              {m.status === 'CONFIRMED' && m.link && (
                <a
                  href={m.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded-pill border border-ink-900 px-3 py-1 text-[11px] text-ink-900 transition-colors hover:bg-warm-100"
                >
                  Join <ExternalLink size={11} />
                </a>
              )}
              <span className={`rounded-pill px-2.5 py-1 text-[10.5px] ${STATUS_STYLE[m.status] ?? 'bg-warm-100 text-ink-700'}`}>
                {m.status.toLowerCase()}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
