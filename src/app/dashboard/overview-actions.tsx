'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ClipboardList, FolderOpen, Store, Wallet, Wrench } from 'lucide-react';
import { RequestChangesModal } from '@/components/modifications/request-changes-modal';
import { useOwnedDesigns } from '@/components/modifications/use-owned-designs';

const cardClass =
  'group flex w-full items-center justify-between rounded-card-lg bg-white p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(0,0,0,0.08)]';

function CardBody({ icon, title, sub, strong }: { icon: React.ReactNode; title: string; sub: string; strong?: boolean }) {
  return (
    <>
      <div className="flex items-center gap-4">
        <div className={`flex h-11 w-11 items-center justify-center rounded-full ${strong ? 'bg-ink-900 text-white' : 'bg-warm-100 text-ink-900'}`}>
          {icon}
        </div>
        <div>
          <div className="text-[14px] font-medium text-ink-900">{title}</div>
          <div className="mt-0.5 text-[11.5px] text-ink-500">{sub}</div>
        </div>
      </div>
      <ArrowRight size={16} className="text-ink-500 transition-transform group-hover:translate-x-1" />
    </>
  );
}

/** Overview shortcuts, with "Request changes" as a first-class action. */
export function OverviewActions() {
  const reduce = useReducedMotion();
  const { designs } = useOwnedDesigns();
  const [open, setOpen] = useState(false);
  const ownsSomething = (designs?.length ?? 0) > 0;

  const items = [
    ownsSomething ? (
      <button key="changes" onClick={() => setOpen(true)} className={`${cardClass} ring-1 ring-ink-900/10`}>
        <CardBody strong icon={<Wrench size={18} />} title="Request changes to a plan" sub="Add a room, resize, open up the kitchen — tracked end to end" />
      </button>
    ) : (
      <Link key="store" href="/designs" className={`${cardClass} ring-1 ring-ink-900/10`}>
        <CardBody strong icon={<Store size={18} />} title="Find your plan" sub="Buy a plan — customise it in the same checkout" />
      </Link>
    ),
    <Link key="requests" href="/dashboard/requests" className={cardClass}>
      <CardBody icon={<ClipboardList size={18} />} title="Requests & tracking" sub="Live progress and messages with the architect" />
    </Link>,
    <Link key="designs" href="/dashboard/designs" className={cardClass}>
      <CardBody icon={<FolderOpen size={18} />} title="My designs" sub="Download files, view order history" />
    </Link>,
    <Link key="referrals" href="/dashboard/referrals" className={cardClass}>
      <CardBody icon={<Wallet size={18} />} title="Referrals & credits" sub="Share your link, spend your balance" />
    </Link>,
  ];

  return (
    <>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: reduce ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduce ? 0 : 0.05 * i, duration: 0.35 }}
          >
            {item}
          </motion.div>
        ))}
      </div>
      <RequestChangesModal open={open} onClose={() => setOpen(false)} designs={designs ?? []} />
    </>
  );
}
