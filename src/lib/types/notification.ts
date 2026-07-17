export type NotificationType =
  | 'ORDER_CONFIRMED'
  | 'QUOTE_READY'
  | 'PAYMENT_RECEIVED'
  | 'STATUS_CHANGE'
  | 'MEETING_BOOKED'
  | 'DELIVERY_COMPLETE'
  | 'REFERRAL_REWARDED';

export interface AppNotification {
  id: string;
  type: NotificationType;
  payload: Record<string, unknown>;
  readAt: string | null;
  sentViaEmail: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: AppNotification[];
  total: number;
  unreadCount: number;
}
