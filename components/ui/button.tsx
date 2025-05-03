import { clsx } from 'clsx';
import { ButtonHTMLAttributes } from 'react';

export type Variant = 'primary' | 'outline' | 'secondary';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({
  className,
  variant = 'primary',
  ...props
}: Props) {
  /* base */
  const base =
    'px-4 py-2 rounded-lg font-medium transition-colors ' +
    'focus:outline-none focus:ring-2 focus:ring-offset-2 ' +
    'disabled:opacity-50 disabled:pointer-events-none ' +
    'ring-offset-white dark:ring-offset-gray-950';

  /* variants */
  const variants: Record<Variant, string> = {
    primary: clsx(
      'bg-blue-600 text-white hover:bg-blue-500',
      'dark:bg-blue-500 dark:hover:bg-blue-400'
    ),

    outline: clsx(
      'border border-blue-600 text-blue-600 hover:bg-blue-50',
      'dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-500/10'
    ),

    secondary: clsx(
      'bg-gray-600 text-white hover:bg-gray-500',
      'dark:bg-gray-700 dark:hover:bg-gray-600'
    )
  };

  return (
    <button
      className={clsx(base, variants[variant], className)}
      {...props}
    />
  );
}
