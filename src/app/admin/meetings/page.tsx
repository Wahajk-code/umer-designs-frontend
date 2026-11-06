import type { Metadata } from 'next';
import { AdminMeetingsView } from './admin-meetings-view';

export const metadata: Metadata = { title: 'Meetings — Admin' };

export default function AdminMeetingsPage() {
  return <AdminMeetingsView />;
}
