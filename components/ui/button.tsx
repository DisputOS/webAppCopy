import { clsx } from 'clsx';
import { ButtonHTMLAttributes } from 'react';

/** Підтримуємо варіанти стилів */
type Variant = 'primary' | 'outline';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ className, variant = 'primary', ...props }: Props) {
  const base =
    'px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variants: Record<Variant, string> = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-400',
    outline:
      'border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-400'
  };

  return (
    <button className={clsx(base, variants[variant], className)} {...props} />
  );
}
