import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/client/cn';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, id, className, ...props },
  ref,
) {
  const inputId = id ?? props.name;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-[11px] font-medium tracking-wide text-ink-700">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        className={cn(
          'rounded-control border border-warm-400 bg-white px-4 py-3 text-[13px] text-ink-900 placeholder:text-ink-500/60 outline-none transition-colors focus:border-ink-900',
          error && 'border-red-400',
          className,
        )}
        {...props}
      />
      {error && <span className="text-[11px] text-red-600">{error}</span>}
    </div>
  );
});
