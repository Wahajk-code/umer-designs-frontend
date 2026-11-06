'use client';

import { useState, FormEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CalendarCheck } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/client/api';
import { cn } from '@/lib/client/cn';

const SLOTS = ['10:00', '11:30', '14:00', '16:00'];

function tomorrowIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function BookMeetingForm({
  modificationId,
  onBooked,
}: {
  modificationId?: string;
  onBooked?: () => void;
}) {
  const reduce = useReducedMotion();
  const [date, setDate] = useState(tomorrowIso());
  const [time, setTime] = useState('11:30');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!date || !time) {
      setError('Pick a date and time.');
      return;
    }
    const when = new Date(`${date}T${time}:00`);
    if (when.getTime() <= Date.now()) {
      setError('Pick a time in the future.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch('/api/meetings', {
        method: 'POST',
        body: { scheduledAt: when.toISOString(), modificationId, notes: notes || undefined },
      });
      setSuccess(when.toLocaleString(undefined, { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }));
      onBooked?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not book this meeting.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {success ? (
        <motion.div
          key="done"
          initial={{ opacity: 0, scale: reduce ? 1 : 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center py-4 text-center"
        >
          <motion.span
            initial={{ scale: reduce ? 1 : 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 16 }}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-900 text-white"
          >
            <CalendarCheck size={22} />
          </motion.span>
          <p className="mt-4 text-[14px] font-medium text-ink-900">Request sent</p>
          <p className="mt-1 text-[12.5px] text-ink-700">{success}</p>
          <p className="mt-3 max-w-xs text-[12px] text-ink-500">
            The architect will confirm (or suggest another time). You&apos;ll get an email and a notification with the
            meeting link.
          </p>
          <button
            onClick={() => {
              setSuccess(null);
              setNotes('');
            }}
            className="mt-5 text-[12px] text-ink-700 underline underline-offset-2"
          >
            Request another time
          </button>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-4"
        >
          <div>
            <label htmlFor="meeting-date" className="text-[11px] font-medium text-ink-700">Date</label>
            <input
              id="meeting-date"
              type="date"
              value={date}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1.5 w-full rounded-control border border-warm-400 bg-white px-3 py-2.5 text-[13px] outline-none transition-colors focus:border-ink-900"
              required
            />
          </div>
          <div>
            <span className="text-[11px] font-medium text-ink-700">Time</span>
            <div className="mt-1.5 grid grid-cols-4 gap-2">
              {SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setTime(slot)}
                  aria-pressed={time === slot}
                  className={cn(
                    'rounded-control border py-2 text-[12.5px] transition-colors',
                    time === slot ? 'border-ink-900 bg-ink-900 text-white' : 'border-warm-400 text-ink-700 hover:border-ink-500',
                  )}
                >
                  {slot}
                </button>
              ))}
            </div>
            <label className="mt-2 flex items-center gap-2 text-[11.5px] text-ink-500">
              or another time
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="rounded-control border border-warm-400 bg-white px-2 py-1 text-[12px] text-ink-900 outline-none focus:border-ink-900"
              />
            </label>
          </div>
          <div>
            <label htmlFor="meeting-notes" className="text-[11px] font-medium text-ink-700">
              What would you like to discuss? <span className="font-normal text-ink-500">(optional)</span>
            </label>
            <textarea
              id="meeting-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={1000}
              className="mt-1.5 h-20 w-full resize-none rounded-control border border-warm-400 bg-white px-3 py-2.5 text-[13px] outline-none transition-colors focus:border-ink-900"
            />
          </div>
          {error && <p className="text-[12px] text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-pill bg-ink-900 py-3 text-[13px] font-medium text-white transition-colors hover:bg-ink-950 disabled:opacity-60"
          >
            {submitting ? 'Sending request…' : 'Request meeting'}
          </button>
          <p className="text-center text-[11px] text-ink-500">Times are in your local time zone. We confirm by email.</p>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
