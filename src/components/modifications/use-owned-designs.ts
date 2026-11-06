'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/client/api';
import { Order } from '@/lib/types/order';
import type { OwnedDesign } from '@/components/modifications/request-changes-modal';

/** Designs the signed-in customer has paid for (null while loading). */
export function useOwnedDesigns(): { designs: OwnedDesign[] | null; orders: Order[] | null; error: boolean; reload: () => void } {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    apiFetch<Order[]>('/api/orders')
      .then((data) => !cancelled && (setOrders(data), setError(false)))
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [tick]);

  const designs = orders
    ? orders
        .filter((o) => o.status === 'PAID')
        .filter((o, i, all) => all.findIndex((x) => x.designId === o.designId) === i)
        .map((o) => ({
          id: o.design.id ?? o.designId,
          title: o.design.title,
          slug: o.design.slug,
          coverImageUrl: o.design.coverImageUrl,
        }))
    : null;

  return { designs, orders, error, reload: () => setTick((t) => t + 1) };
}
