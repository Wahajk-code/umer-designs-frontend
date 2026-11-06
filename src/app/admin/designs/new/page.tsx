import { redirect } from 'next/navigation';

/** Creating a design is a modal on the designs list now. */
export default function NewDesignPage() {
  redirect('/admin/designs?new=1');
}
