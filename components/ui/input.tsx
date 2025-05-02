import { forwardRef, InputHTMLAttributes } from "react";
import { clsx } from "clsx";

/**
 * Базовий Tailwind‑стилізований <input> із forwardRef
 */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Додаткові класи Tailwind */
  className?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={clsx(
          "block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400",
          "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
