import { Design, DesignFile } from '@/lib/types/design';

export type OrderStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface Order {
  id: string;
  userId: string;
  designId: string;
  amountCents: number;
  status: OrderStatus;
  paidAt: string | null;
  createdAt: string;
  design: Design & { files?: DesignFile[] };
}
