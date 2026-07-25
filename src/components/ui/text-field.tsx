'use client';

import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/client/cn';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, id, className, type, ...props },
  ref,
) {
  const inputId = id ?? props.name;
  const isPassword = type === 'password';
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-[11px] font-medium tracking-wide text-ink-700">
        {label}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={isPassword ? (visible ? 'text' : 'password') : type}
          className={cn(
            'w-full rounded-control border border-warm-400 bg-white px-4 py-3 text-[13px] text-ink-900 placeholder:text-ink-500/60 outline-none transition-colors focus:border-ink-900',
            isPassword && 'pr-11',
            error && 'border-red-400',
            className,
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
            className="absolute right-3.5 top-1/2 flex -translate-y-1/2 items-center justify-center text-ink-500 transition-colors hover:text-ink-900"
          >
            {visible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <span className="text-[11px] text-red-600">{error}</span>}
    </div>
  );
});
