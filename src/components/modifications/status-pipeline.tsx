import { ModificationStatus, MODIFICATION_STAGES } from '@/lib/types/modification';

const STAGE_LABEL: Record<ModificationStatus, string> = {
  SUBMITTED: 'Submitted',
  IN_REVIEW: 'In review',
  IN_PROGRESS: 'In progress',
  REVISION: 'Revision',
  DELIVERED: 'Delivered',
};

export function StatusPipeline({ status, dark = false }: { status: ModificationStatus; dark?: boolean }) {
  const currentIndex = MODIFICATION_STAGES.indexOf(status);

  const dotColor = (i: number) => {
    if (i < currentIndex) return dark ? 'bg-white' : 'bg-ink-900';
    if (i === currentIndex) return dark ? 'bg-ink-950' : 'bg-white';
    return dark ? 'bg-dark-700' : 'bg-warm-400';
  };
  const lineColor = (i: number) => (i < currentIndex ? (dark ? 'bg-white' : 'bg-ink-900') : dark ? 'bg-dark-700' : 'bg-warm-400');
  const labelColor = (i: number) =>
    i <= currentIndex ? (dark ? 'text-white' : 'text-ink-900') : dark ? 'text-dark-500' : 'text-ink-500';

  return (
    <div>
      <div className="flex items-center">
        {MODIFICATION_STAGES.map((stage, i) => (
          <div key={stage} className="flex flex-1 items-center last:flex-none">
            <div
              className={`h-3 w-3 rounded-full ${dotColor(i)} ${
                i === currentIndex ? `ring-2 ${dark ? 'ring-white' : 'ring-ink-900'}` : ''
              }`}
            />
            {i < MODIFICATION_STAGES.length - 1 && <div className={`h-0.5 flex-1 ${lineColor(i)}`} />}
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[9px] tracking-wide">
        {MODIFICATION_STAGES.map((stage, i) => (
          <span key={stage} className={`${labelColor(i)} ${i === currentIndex ? 'font-semibold' : ''}`}>
            {STAGE_LABEL[stage].toUpperCase()}
          </span>
        ))}
      </div>
    </div>
  );
}
