import { Design } from '@/lib/types/design';

export type ModificationStatus = 'SUBMITTED' | 'IN_REVIEW' | 'IN_PROGRESS' | 'REVISION' | 'DELIVERED';

export interface ModificationOption {
  id: string;
  label: string;
  description: string | null;
  addedCostCents: number;
  active: boolean;
}

export interface ModificationSelectedOption {
  id: string;
  optionId: string;
  priceAtSelectionCents: number;
  option: ModificationOption;
}

export interface ModificationEventAuthor {
  id: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN';
}

export interface ModificationEvent {
  id: string;
  kind: 'STATUS_CHANGE' | 'COMMENT';
  fromStatus: ModificationStatus | null;
  toStatus: ModificationStatus | null;
  comment: string | null;
  authorId: string | null;
  author: ModificationEventAuthor | null;
  createdAt: string;
}

export interface ModificationFile {
  id: string;
  label: string;
  resourceType: string;
  format: string;
  isFinal: boolean;
  createdAt: string;
}

export interface ModificationClient {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

/** Row in the admin queue: includes the client and the latest event (for "last activity"). */
export interface AdminModificationRow extends Omit<Modification, 'events' | 'files'> {
  user: ModificationClient;
  events: { createdAt: string; kind: 'STATUS_CHANGE' | 'COMMENT'; author: { role: 'USER' | 'ADMIN' } | null }[];
}

/** One conversation in the admin Messages inbox. */
export interface MessageThread {
  modificationId: string;
  status: ModificationStatus;
  createdAt: string;
  design: { id: string; title: string; slug: string; coverImageUrl: string };
  client: ModificationClient;
  messageCount: number;
  lastMessage: { comment: string | null; createdAt: string; fromAdmin: boolean; authorName: string | null } | null;
  awaitingReply: boolean;
  lastActivityAt: string;
}

export interface Modification {
  user?: ModificationClient;
  id: string;
  userId: string;
  designId: string;
  status: ModificationStatus;
  basePriceCents: number;
  totalAmountCents: number;
  paidAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  design: Design;
  selectedOptions: ModificationSelectedOption[];
  events: ModificationEvent[];
  files: ModificationFile[];
}

export const MODIFICATION_STAGES: ModificationStatus[] = [
  'SUBMITTED',
  'IN_REVIEW',
  'IN_PROGRESS',
  'REVISION',
  'DELIVERED',
];
