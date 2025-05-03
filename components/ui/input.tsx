import { forwardRef, InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';

/**
 * Tailwind‑styled <input> with dark‑mode support
 */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={clsx(
        // light mode defaults
        'block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400',
        // dark mode overrides
        'dark:bg-gray-950 dark:border-gray-700 dark:text-white dark:placeholder-gray-500',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
        className
      )}
      {...props}
    />
  );
});

Input.displayName = 'Input';
