'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ChevronRight, User, Mail, Lock } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/client/api';
import { TextField } from '@/components/ui/text-field';
import { Button } from '@/components/ui/button';
import { Modal, ModalCloseButton } from '@/components/ui/modal';
import { PasswordRequirements, passwordMeetsRequirements } from '@/components/auth/password-requirements';
import { SafeUser } from '@/lib/types/user';

type SettingsSection = 'profile' | 'email' | 'password' | null;

function SettingsRow({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-card-lg bg-white p-5 text-left transition-colors hover:bg-warm-50"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warm-100 text-ink-700">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-medium text-ink-900">{title}</p>
        <p className="mt-0.5 truncate text-[12px] text-ink-500">{description}</p>
      </div>
      <ChevronRight size={16} className="shrink-0 text-ink-300" />
    </button>
  );
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between border-b border-warm-200 p-5">
      <h2 className="text-[15px] font-medium text-ink-900">{title}</h2>
      <ModalCloseButton onClose={onClose} />
    </div>
  );
}

function ProfileForm({ user, onDone }: { user: SafeUser; onDone: () => void }) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      await apiFetch('/api/users/me', { method: 'PATCH', body: { firstName, lastName } });
      toast.success('Profile updated');
      router.refresh();
      onDone();
    } catch (err) {
      toast.error('Could not update profile', {
        description: err instanceof ApiError ? err.message : 'Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }

  const unchanged = firstName === user.firstName && lastName === user.lastName;

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 p-5">
      <div className="grid grid-cols-2 gap-3">
        <TextField label="First name" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        <TextField label="Last name" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
      </div>
      <Button type="submit" loading={loading} disabled={unchanged || !firstName.trim() || !lastName.trim()} className="w-fit">
        Save profile
      </Button>
    </form>
  );
}

function EmailForm({ currentEmail, onDone }: { currentEmail: string; onDone: () => void }) {
  const router = useRouter();
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      await apiFetch('/api/auth/email', { method: 'PATCH', body: { newEmail, currentPassword } });
      toast.success('Email updated');
      setNewEmail('');
      setCurrentPassword('');
      router.refresh();
      onDone();
    } catch (err) {
      toast.error('Could not update email', {
        description: err instanceof ApiError ? err.message : 'Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 p-5">
      <div className="text-[12.5px] text-ink-500">
        Current: <span className="font-medium text-ink-900">{currentEmail}</span>
      </div>
      <TextField
        label="New email"
        type="email"
        required
        value={newEmail}
        onChange={(e) => setNewEmail(e.target.value)}
      />
      <TextField
        label="Current password"
        type="password"
        required
        autoComplete="current-password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
      />
      <Button
        type="submit"
        loading={loading}
        disabled={!newEmail.trim() || !currentPassword}
        className="w-fit"
      >
        Update email
      </Button>
    </form>
  );
}

function PasswordForm({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [loading, setLoading] = useState(false);

  const canSubmit = currentPassword.length > 0 && passwordMeetsRequirements(newPassword);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) {
      setPasswordTouched(true);
      return;
    }
    setLoading(true);
    try {
      await apiFetch('/api/auth/password', { method: 'PATCH', body: { currentPassword, newPassword } });
      toast.success('Password changed', { description: 'Please sign in again with your new password.' });
      onDone();
      router.push('/sign-in');
      router.refresh();
    } catch (err) {
      toast.error('Could not change password', {
        description: err instanceof ApiError ? err.message : 'Please try again.',
      });
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 p-5">
      <TextField
        label="Current password"
        type="password"
        required
        autoComplete="current-password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
      />
      <div>
        <TextField
          label="New password"
          type="password"
          required
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          onFocus={() => setPasswordTouched(true)}
        />
        {passwordTouched && <PasswordRequirements value={newPassword} />}
      </div>
      <p className="text-[11.5px] text-ink-500">
        Changing your password signs you out on every device — you&apos;ll need to sign in again here too.
      </p>
      <Button type="submit" loading={loading} disabled={!canSubmit} className="w-fit">
        Change password
      </Button>
    </form>
  );
}

export function AccountSettingsForms({ user }: { user: SafeUser }) {
  const [openSection, setOpenSection] = useState<SettingsSection>(null);

  return (
    <div className="mt-7 flex max-w-lg flex-col gap-3">
      <SettingsRow
        icon={<User size={16} />}
        title="Profile"
        description={`${user.firstName} ${user.lastName}`}
        onClick={() => setOpenSection('profile')}
      />
      <SettingsRow
        icon={<Mail size={16} />}
        title="Email"
        description={user.email}
        onClick={() => setOpenSection('email')}
      />
      <SettingsRow
        icon={<Lock size={16} />}
        title="Password"
        description="Change your password"
        onClick={() => setOpenSection('password')}
      />

      <Modal open={openSection === 'profile'} onClose={() => setOpenSection(null)} className="w-[92vw] max-w-md">
        <ModalHeader title="Edit profile" onClose={() => setOpenSection(null)} />
        <ProfileForm user={user} onDone={() => setOpenSection(null)} />
      </Modal>

      <Modal open={openSection === 'email'} onClose={() => setOpenSection(null)} className="w-[92vw] max-w-md">
        <ModalHeader title="Change email" onClose={() => setOpenSection(null)} />
        <EmailForm currentEmail={user.email} onDone={() => setOpenSection(null)} />
      </Modal>

      <Modal open={openSection === 'password'} onClose={() => setOpenSection(null)} className="w-[92vw] max-w-md">
        <ModalHeader title="Change password" onClose={() => setOpenSection(null)} />
        <PasswordForm onDone={() => setOpenSection(null)} />
      </Modal>
    </div>
  );
}
