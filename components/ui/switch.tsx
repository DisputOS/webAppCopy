// components/ui/Toggle.tsx
import React from 'react';

export function Toggle({ checked, onChange, id }: {
  checked: boolean;
  onChange: (value: boolean) => void;
  id: string;
}) {
  return (
    <label htmlFor={id} className="flex items-center cursor-pointer space-x-3">
      <div className="relative">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div className={`block w-12 h-6 rounded-full transition duration-300 ${checked ? 'bg-green-500' : 'bg-gray-600'}`}></div>
        <div className={`dot absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition ${checked ? 'translate-x-6' : ''}`}></div>
      </div>
    </label>
  );
}
