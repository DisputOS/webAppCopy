// components/ui/Label.tsx
import React from 'react';
import type { LabelHTMLAttributes } from 'react';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  htmlFor: string;
  children: React.ReactNode;
}

export function Label({ htmlFor, children, className = '', ...props }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block mb-1 text-sm font-medium text-gray-300 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}
