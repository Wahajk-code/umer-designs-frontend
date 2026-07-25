import { CheckCircle2, Download, ShieldCheck } from 'lucide-react';

const ITEMS = [
  { icon: Download, label: 'Instant file delivery' },
  { icon: CheckCircle2, label: 'Build-ready CAD + PDF sets' },
  { icon: ShieldCheck, label: 'Pay once, yours forever' },
];

export function ShopBanner() {
  return (
    <div className="bg-ink-900 text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-5 py-2.5 text-[11px] tracking-wide sm:px-8 lg:px-12">
        {ITEMS.map((item) => (
          <span key={item.label} className="flex items-center gap-1.5 text-dark-500">
            <item.icon size={12} className="text-white" />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
