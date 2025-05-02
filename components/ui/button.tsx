import { clsx } from 'clsx';
import { ButtonHTMLAttributes } from 'react';

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={clsx('px-4 py-2 bg-blue-600 text-white rounded', className)} {...props} />;
}
