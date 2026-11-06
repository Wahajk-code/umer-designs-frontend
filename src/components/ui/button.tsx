import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/client/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  /** Label shown while loading (default "Please wait…"). */
  loadingText?: string;
}

const base =
  'inline-flex items-center justify-center rounded-pill text-[13px] font-medium px-6 py-3 transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none';

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-ink-900 text-white hover:bg-ink-950',
  secondary: 'border border-ink-900 text-ink-900 hover:bg-warm-100',
  ghost: 'text-ink-700 hover:bg-warm-100',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', loading, loadingText = 'Please wait…', disabled, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(base, variants[variant], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
          {loadingText}
        </span>
      ) : (
        children
      )}
    </button>
  );
});
