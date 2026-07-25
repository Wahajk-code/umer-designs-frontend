'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/client/cn';

interface Rule {
  label: string;
  test: (value: string) => boolean;
}

const RULES: Rule[] = [
  { label: 'At least 10 characters', test: (v) => v.length >= 10 },
  { label: 'One uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { label: 'One lowercase letter', test: (v) => /[a-z]/.test(v) },
  { label: 'One number', test: (v) => /\d/.test(v) },
];

export function passwordMeetsRequirements(value: string): boolean {
  return RULES.every((rule) => rule.test(value));
}

export function PasswordRequirements({ value }: { value: string }) {
  return (
    <ul className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
      {RULES.map((rule) => {
        const met = rule.test(value);
        return (
          <li key={rule.label} className="flex items-center gap-2 text-[11px]">
            <span
              className={cn(
                'flex h-4 w-4 flex-none items-center justify-center rounded-full border transition-colors duration-200',
                met ? 'border-ink-900 bg-ink-900 text-white' : 'border-warm-500 bg-white text-transparent',
              )}
            >
              <Check size={11} strokeWidth={3} />
            </span>
            <span className={cn('transition-colors duration-200', met ? 'text-ink-700' : 'text-ink-500')}>
              {rule.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
