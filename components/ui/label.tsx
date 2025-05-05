// components/ui/Label.tsx
import React from 'react';
import type { LabelHTMLAttributes } from 'react';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  htmlFor?: string; // ← тепер НЕ обов'язковий
}

export function Label({ children, className = '', htmlFor, ...props }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-sm font-medium text-gray-300 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}
