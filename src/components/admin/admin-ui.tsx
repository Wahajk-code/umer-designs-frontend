'use client';

import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { AlertCircle, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/client/cn';
import { Modal } from '@/components/ui/modal';
import { ModificationStatus } from '@/lib/types/modification';

/* ───────────────────────── Layout ───────────────────────── */

export function AdminPageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-6">
      {back && (
        <Link
          href={back.href}
          className="mb-3 inline-flex items-center gap-1.5 rounded-pill px-2 py-1 -ml-2 text-[11.5px] text-dark-500 transition-colors hover:bg-white/5 hover:text-white"
        >
          <ArrowLeft size={13} /> {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[22px] font-light tracking-tight text-white">{title}</h1>
          {description && <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-dark-500">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

/** The admin card: soft light grey on the dark chrome, rounded, with depth. */
export function Panel({ className, children, delay = 0 }: { className?: string; children: ReactNode; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.section
      initial={{ opacity: 0, y: reduce ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut', delay: reduce ? 0 : delay }}
      className={cn('overflow-hidden rounded-card bg-panel text-ink-900 shadow-panel ring-1 ring-black/5', className)}
    >
      {children}
    </motion.section>
  );
}

export function PanelHeader({
  title,
  count,
  description,
  actions,
  className,
}: {
  title: ReactNode;
  count?: number;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-3 border-b border-panel-300 px-5 py-4', className)}>
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-[13px] font-medium text-ink-900">
          {title}
          {typeof count === 'number' && (
            <span className="rounded-pill bg-panel-200 px-2 py-0.5 text-[10.5px] font-normal text-ink-700">{count}</span>
          )}
        </div>
        {description && <p className="mt-0.5 text-[11.5px] text-ink-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function PanelLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('text-[10px] font-medium uppercase tracking-[0.12em] text-ink-500', className)}>{children}</div>;
}

/* ───────────────────────── Loading / empty / error ───────────────────────── */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-panel-300/70', className)} />;
}

/** Placeholder rows shaped like the real table so the layout never jumps. */
export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="divide-y divide-panel-300" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-5 py-3.5">
          <Skeleton className="h-9 w-9 flex-none rounded-control" />
          {Array.from({ length: cols - 1 }).map((__, c) => (
            <Skeleton key={c} className={cn('h-3', c === 0 ? 'w-1/4' : c === cols - 2 ? 'ml-auto w-16' : 'w-1/6')} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 4, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-2.5 p-5', className)} aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 flex-none rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-2/5" />
            <Skeleton className="h-2.5 w-3/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  hint,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  hint?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-14 text-center', className)}>
      {icon && (
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-panel-200 text-ink-500">{icon}</div>
      )}
      <div className="text-[13px] font-medium text-ink-900">{title}</div>
      {hint && <p className="mt-1 max-w-sm text-[12px] leading-relaxed text-ink-500">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorBanner({ message, onRetry, className }: { message: string; onRetry?: () => void; className?: string }) {
  return (
    <div className={cn('flex items-center gap-2 rounded-control bg-red-50 px-4 py-3 text-[12px] text-red-700 ring-1 ring-red-200', className)}>
      <AlertCircle size={14} className="flex-none" />
      <span className="flex-1">{message}</span>
      {onRetry && (
        <button onClick={onRetry} className="rounded-pill px-2.5 py-1 font-medium underline-offset-2 hover:underline">
          Retry
        </button>
      )}
    </div>
  );
}

/* ───────────────────────── Controls ───────────────────────── */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'light';

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-ink-950 text-white hover:bg-black shadow-sm',
  secondary: 'bg-panel-100 text-ink-900 ring-1 ring-panel-300 hover:bg-white',
  ghost: 'text-ink-700 hover:bg-panel-200',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  /** for use on the dark chrome (page headers) */
  light: 'bg-white text-ink-900 hover:bg-warm-100 shadow-sm',
};

interface AdminButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md';
  loading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
}

export const AdminButton = forwardRef<HTMLButtonElement, AdminButtonProps>(function AdminButton(
  { variant = 'primary', size = 'md', loading, loadingText, icon, className, disabled, children, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex flex-none items-center justify-center gap-1.5 rounded-pill font-medium transition-all duration-150 active:scale-[0.98] disabled:opacity-50',
        size === 'sm' ? 'h-8 px-3.5 text-[11.5px]' : 'h-10 px-5 text-[12.5px]',
        BUTTON_VARIANTS[variant],
        className,
      )}
      {...props}
    >
      {loading ? (
        <>
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
          {loadingText ?? children}
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
});

export const adminInput =
  'h-10 w-full rounded-control border border-panel-300 bg-panel-100 px-3.5 text-[12.5px] text-ink-900 outline-none transition-colors placeholder:text-ink-500/70 focus:border-ink-900 focus:bg-white disabled:opacity-60';

export const adminTextarea =
  'w-full rounded-control border border-panel-300 bg-panel-100 px-3.5 py-2.5 text-[12.5px] leading-relaxed text-ink-900 outline-none transition-colors placeholder:text-ink-500/70 focus:border-ink-900 focus:bg-white';

export function Field({
  label,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string | null;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1.5 block text-[11px] font-medium text-ink-700">{label}</span>
      {children}
      {error ? (
        <span className="mt-1 block text-[11px] text-red-600">{error}</span>
      ) : (
        hint && <span className="mt-1 block text-[11px] text-ink-500">{hint}</span>
      )}
    </label>
  );
}

export function Toggle({ checked, onChange, busy, label }: { checked: boolean; onChange: () => void; busy?: boolean; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={label}
      onClick={onChange}
      disabled={busy}
      className={cn('relative h-5 w-9 flex-none rounded-full transition-colors disabled:opacity-60', checked ? 'bg-ink-900' : 'bg-panel-300')}
    >
      <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all', checked ? 'left-[18px]' : 'left-0.5')} />
    </button>
  );
}

export function FilterTabs<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { label: string; value: T; count?: number }[];
  className?: string;
}) {
  return (
    <div className={cn('inline-flex flex-wrap gap-1 rounded-pill bg-white/5 p-1 ring-1 ring-white/10', className)} role="tablist">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value || 'all'}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              'relative flex items-center gap-1.5 rounded-pill px-3.5 py-1.5 text-[11.5px] transition-colors',
              active ? 'text-ink-900' : 'text-dark-500 hover:text-white',
            )}
          >
            {active && (
              <motion.span
                layoutId={`filter-pill-${options.map((o) => o.value).join('')}`}
                className="absolute inset-0 rounded-pill bg-white shadow-sm"
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              />
            )}
            <span className="relative">{opt.label}</span>
            {typeof opt.count === 'number' && (
              <span
                className={cn(
                  'relative rounded-pill px-1.5 text-[10px]',
                  active ? 'bg-panel-200 text-ink-700' : 'bg-white/10 text-dark-500',
                )}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-panel-300 px-5 py-3 text-[11.5px] text-ink-500">
      <span>
        Page {page} of {totalPages}
      </span>
      <div className="flex gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="flex h-8 w-8 items-center justify-center rounded-full text-ink-700 transition-colors hover:bg-panel-200 disabled:opacity-40"
        >
          <ChevronLeft size={15} />
        </button>
        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className="flex h-8 w-8 items-center justify-center rounded-full text-ink-700 transition-colors hover:bg-panel-200 disabled:opacity-40"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

/* ───────────────────────── Badges / identity ───────────────────────── */

export const MOD_STATUS_LABEL: Record<ModificationStatus, string> = {
  SUBMITTED: 'Submitted',
  IN_REVIEW: 'In review',
  IN_PROGRESS: 'In progress',
  REVISION: 'Revision',
  DELIVERED: 'Delivered',
};

const MOD_STATUS_STYLE: Record<ModificationStatus, string> = {
  SUBMITTED: 'bg-amber-100 text-amber-800 ring-amber-200',
  IN_REVIEW: 'bg-sky-100 text-sky-800 ring-sky-200',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-800 ring-indigo-200',
  REVISION: 'bg-orange-100 text-orange-800 ring-orange-200',
  DELIVERED: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
};

export function StatusBadge({ status }: { status: ModificationStatus }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-pill px-2.5 py-1 text-[10.5px] font-medium ring-1', MOD_STATUS_STYLE[status])}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {MOD_STATUS_LABEL[status]}
    </span>
  );
}

/** Generic pill for other statuses (meetings, links, designs). */
export function Pill({ tone = 'neutral', children }: { tone?: 'neutral' | 'green' | 'amber' | 'red' | 'blue' | 'dark'; children: ReactNode }) {
  const tones = {
    neutral: 'bg-panel-200 text-ink-700 ring-panel-300',
    green: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
    amber: 'bg-amber-100 text-amber-800 ring-amber-200',
    red: 'bg-red-100 text-red-700 ring-red-200',
    blue: 'bg-sky-100 text-sky-800 ring-sky-200',
    dark: 'bg-ink-900 text-white ring-ink-900',
  } as const;
  return (
    <span className={cn('inline-flex items-center whitespace-nowrap rounded-pill px-2.5 py-1 text-[10.5px] font-medium ring-1', tones[tone])}>
      {children}
    </span>
  );
}

export function fullName(p?: { firstName?: string | null; lastName?: string | null; email?: string | null } | null): string {
  if (!p) return 'Unknown client';
  return `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() || p.email || 'Unknown client';
}

export function Avatar({ name, size = 32, dark }: { name: string; size?: number; dark?: boolean }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('');
  return (
    <span
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
      className={cn(
        'flex flex-none items-center justify-center rounded-full font-medium',
        dark ? 'bg-ink-900 text-white' : 'bg-panel-300 text-ink-900',
      )}
      aria-hidden
    >
      {initials || '?'}
    </span>
  );
}

export function timeAgo(iso: string): string {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

/* ───────────────────────── Dialogs ───────────────────────── */

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  danger,
  loading,
  onConfirm,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  body?: ReactNode;
  confirmLabel: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  children?: ReactNode;
}) {
  return (
    <Modal open={open} onClose={() => !loading && onClose()} className="w-[92vw] max-w-md bg-panel" labelledBy="confirm-title">
      <div className="p-6">
        <h2 id="confirm-title" className="text-[16px] font-medium text-ink-900">
          {title}
        </h2>
        {body && <div className="mt-2 text-[12.5px] leading-relaxed text-ink-700">{body}</div>}
        {children && <div className="mt-4">{children}</div>}
        <div className="mt-6 flex justify-end gap-2">
          <AdminButton variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </AdminButton>
          <AdminButton variant={danger ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </AdminButton>
        </div>
      </div>
    </Modal>
  );
}

/** Standard admin modal shell: header with title/description, scroll body, sticky footer. */
export function AdminModal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy="admin-modal-title"
      className={cn('flex max-h-[92vh] w-[95vw] flex-col overflow-hidden bg-panel', wide ? 'max-w-4xl' : 'max-w-lg')}
    >
      <div className="flex items-start justify-between gap-3 border-b border-panel-300 px-6 py-4">
        <div>
          <h2 id="admin-modal-title" className="text-[16px] font-medium text-ink-900">
            {title}
          </h2>
          {description && <p className="mt-0.5 text-[11.5px] text-ink-500">{description}</p>}
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-panel-200 hover:text-ink-900"
        >
          ✕
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      {footer && <div className="flex justify-end gap-2 border-t border-panel-300 bg-panel px-6 py-3.5">{footer}</div>}
    </Modal>
  );
}

/** Table primitives — consistent column headers and row hover. */
export const th = 'px-5 py-3 text-left text-[10px] font-medium uppercase tracking-[0.1em] text-ink-500';
export const td = 'px-5 py-3.5 align-middle text-[12.5px] text-ink-900';
export const tr = 'border-t border-panel-300 transition-colors hover:bg-panel-200/60';
