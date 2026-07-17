export type MeetingStatus = 'REQUESTED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface Meeting {
  id: string;
  userId: string;
  modificationId: string | null;
  status: MeetingStatus;
  scheduledAt: string;
  link: string | null;
  notes: string | null;
  createdAt: string;
}
