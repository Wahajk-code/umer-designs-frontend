import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/client/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
}

const base =
  'inline-flex items-center justify-center rounded-pill text-[13px] font-medium px-6 py-3 transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none';

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-ink-900 text-white hover:bg-ink-950',
  secondary: 'border border-ink-900 text-ink-900 hover:bg-warm-100',
  ghost: 'text-ink-700 hover:bg-warm-100',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', loading, disabled, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(base, variants[variant], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Please wait…' : children}
    </button>
  );
});
