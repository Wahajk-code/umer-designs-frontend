'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { toast } from 'sonner';
import { Check, ChevronRight, RotateCcw } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/client/api';
import { MODIFICATION_STAGES, ModificationStatus } from '@/lib/types/modification';
import { cn } from '@/lib/client/cn';
import { AdminButton, ConfirmDialog, MOD_STATUS_LABEL, adminTextarea } from '@/components/admin/admin-ui';

const STAGE_HINT: Record<ModificationStatus, string> = {
  SUBMITTED: 'Paid and waiting for you to look at it',
  IN_REVIEW: 'You are reviewing the brief and the site',
  IN_PROGRESS: 'Drawings are being updated',
  REVISION: 'Client asked for tweaks — working on them',
  DELIVERED: 'Final files are with the client',
};

/**
 * The architect's control over the client's progress bar. Click any stage to
 * move the request there (forward, back, or reopen) — each move is logged,
 * shown on the client's tracking page, and notified by email.
 */
export function ProgressControl({
  modificationId,
  status,
  hasFinalFiles,
  onChanged,
}: {
  modificationId: string;
  status: ModificationStatus;
  hasFinalFiles: boolean;
  onChanged: () => Promise<void> | void;
}) {
  const reduce = useReducedMotion();
  const [target, setTarget] = useState<ModificationStatus | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const currentIndex = MODIFICATION_STAGES.indexOf(status);
  const next = MODIFICATION_STAGES[currentIndex + 1] === 'REVISION' ? 'DELIVERED' : MODIFICATION_STAGES[currentIndex + 1];
  const progress = currentIndex / (MODIFICATION_STAGES.length - 1);

  async function apply() {
    if (!target) return;
    setSaving(true);
    try {
      await apiFetch(`/api/admin/modifications/${modificationId}/status`, {
        method: 'PATCH',
        body: { status: target, ...(note.trim() && { comment: note.trim() }) },
      });
      toast.success(`Moved to ${MOD_STATUS_LABEL[target].toLowerCase()}`, { description: 'The client has been notified.' });
      setTarget(null);
      setNote('');
      await onChanged();
    } catch (err) {
      toast.error('Could not update the stage', { description: err instanceof ApiError ? err.message : 'Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  const backwards = target !== null && MODIFICATION_STAGES.indexOf(target) < currentIndex;

  return (
    <div className="px-5 py-5">
      <div className="relative">
        {/* track */}
        <div className="absolute left-[10%] right-[10%] top-[15px] h-1 rounded-full bg-panel-300" />
        <motion.div
          className="absolute left-[10%] top-[15px] h-1 rounded-full bg-ink-900"
          initial={false}
          animate={{ width: `${progress * 80}%` }}
          transition={{ duration: reduce ? 0 : 0.5, ease: 'easeOut' }}
        />
        <ol className="relative grid grid-cols-5">
          {MODIFICATION_STAGES.map((stage, i) => {
            const done = i < currentIndex;
            const current = i === currentIndex;
            return (
              <li key={stage} className="flex flex-col items-center text-center">
                <button
                  type="button"
                  onClick={() => !current && setTarget(stage)}
                  disabled={current}
                  aria-current={current ? 'step' : undefined}
                  title={current ? 'Current stage' : `Move to ${MOD_STATUS_LABEL[stage]}`}
                  className={cn(
                    'relative flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-medium ring-4 ring-panel transition-all',
                    current && 'bg-ink-900 text-white disabled:opacity-100',
                    done && 'bg-ink-900 text-white hover:scale-110',
                    !done && !current && 'bg-white text-ink-500 ring-panel hover:scale-110 hover:text-ink-900 border border-panel-300',
                  )}
                >
                  {current && !reduce && (
                    <motion.span
                      className="absolute inset-0 rounded-full bg-ink-900"
                      animate={{ scale: [1, 1.5], opacity: [0.35, 0] }}
                      transition={{ duration: 1.6, repeat: Infinity }}
                    />
                  )}
                  <span className="relative">{done ? <Check size={14} /> : i + 1}</span>
                </button>
                <span className={cn('mt-2 text-[11px] leading-tight', current ? 'font-semibold text-ink-900' : 'text-ink-500')}>
                  {MOD_STATUS_LABEL[stage]}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-card-sm bg-panel-100 px-4 py-3 ring-1 ring-panel-300">
        <div className="min-w-0">
          <div className="text-[12.5px] font-medium text-ink-900">Now: {MOD_STATUS_LABEL[status]}</div>
          <div className="text-[11.5px] text-ink-500">{STAGE_HINT[status]}</div>
        </div>
        {status === 'DELIVERED' ? (
          <AdminButton size="sm" variant="secondary" icon={<RotateCcw size={12} />} onClick={() => setTarget('REVISION')}>
            Reopen as revision
          </AdminButton>
        ) : (
          next && (
            <AdminButton size="sm" onClick={() => setTarget(next)}>
              Move to {MOD_STATUS_LABEL[next].toLowerCase()} <ChevronRight size={13} />
            </AdminButton>
          )
        )}
      </div>
      <p className="mt-2 text-[10.5px] text-ink-500">Tip: click any step to jump straight to it — forwards or back.</p>

      <ConfirmDialog
        open={target !== null}
        title={target ? `Move to “${MOD_STATUS_LABEL[target]}”?` : ''}
        body={
          <>
            {backwards ? 'This moves the request back a step. ' : ''}
            The client sees the new stage on their tracking page and gets an email.
            {target === 'DELIVERED' && !hasFinalFiles && (
              <span className="mt-2 block rounded-control bg-amber-50 px-3 py-2 text-amber-800 ring-1 ring-amber-200">
                No final files are uploaded yet — upload them first so the client can download on delivery.
              </span>
            )}
          </>
        }
        confirmLabel={target ? `Move to ${MOD_STATUS_LABEL[target].toLowerCase()}` : 'Confirm'}
        loading={saving}
        onConfirm={apply}
        onClose={() => {
          setTarget(null);
          setNote('');
        }}
      >
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-medium text-ink-700">Note to the client (optional)</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={1000}
            rows={3}
            placeholder="e.g. First draft of the new kitchen layout is underway — expect it Friday."
            className={cn(adminTextarea, 'resize-none')}
          />
        </label>
      </ConfirmDialog>
    </div>
  );
}
