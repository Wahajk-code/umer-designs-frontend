import type { Metadata } from 'next';
import { DesignForm } from '../design-form';

export const metadata: Metadata = { title: 'New design — Admin' };

export default function NewDesignPage() {
  return (
    <div>
      <h1 className="text-[18px] font-medium text-white">New design</h1>
      <p className="mt-1 text-[12px] text-dark-500">
        Designs are created as drafts. Publish once the details and cover image are ready.
      </p>
      <div className="mt-6">
        <DesignForm />
      </div>
    </div>
  );
}
