import { Suspense } from 'react';
import type { Metadata } from 'next';
import { MessagesInbox } from './messages-inbox';

export const metadata: Metadata = { title: 'Messages — Admin' };

export default function AdminMessagesPage() {
  return (
    <Suspense>
      <MessagesInbox />
    </Suspense>
  );
}
