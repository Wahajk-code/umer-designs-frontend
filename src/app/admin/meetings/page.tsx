import type { Metadata } from 'next';
import { AdminMeetingsView } from './admin-meetings-view';

export const metadata: Metadata = { title: 'Meetings — Admin' };

export default function AdminMeetingsPage() {
  return (
    <div>
      <h1 className="text-[18px] font-medium text-white">Meetings</h1>
      <div className="mt-4">
        <AdminMeetingsView />
      </div>
    </div>
  );
}
