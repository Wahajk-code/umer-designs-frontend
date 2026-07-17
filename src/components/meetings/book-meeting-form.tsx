'use client';

import { useState, FormEvent } from 'react';
import { apiFetch, ApiError } from '@/lib/client/api';
import { Button } from '@/components/ui/button';

export function BookMeetingForm({
  modificationId,
  onBooked,
}: {
  modificationId?: string;
  onBooked?: () => void;
}) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('11:30');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!date) {
      setError('Pick a date.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const scheduledAt = new Date(`${date}T${time}:00`).toISOString();
      await apiFetch('/api/meetings', {
        method: 'POST',
        body: { scheduledAt, modificationId, notes: notes || undefined },
      });
      setSuccess(true);
      onBooked?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not book this meeting.');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <p className="text-[12.5px] text-ink-700">
        Request sent — we confirm by email once the architect accepts a time.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-medium text-ink-700">Date</label>
          <input
            type="date"
            value={date}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1.5 w-full rounded-control border border-warm-400 bg-white px-3 py-2.5 text-[13px] outline-none focus:border-ink-900"
            required
          />
        </div>
        <div>
          <label className="text-[11px] font-medium text-ink-700">Time</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="mt-1.5 w-full rounded-control border border-warm-400 bg-white px-3 py-2.5 text-[13px] outline-none focus:border-ink-900"
            required
          />
        </div>
      </div>
      <div>
        <label className="text-[11px] font-medium text-ink-700">What would you like to discuss?</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-1.5 h-20 w-full rounded-control border border-warm-400 bg-white px-3 py-2.5 text-[13px] outline-none focus:border-ink-900"
        />
      </div>
      {error && <p className="text-[12px] text-red-600">{error}</p>}
      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? 'Requesting…' : 'Request meeting'}
      </Button>
      <p className="text-center text-[11px] text-ink-500">
        We confirm by email — both of us get the invite.
      </p>
    </form>
  );
}
