// -----------------------------------------------------------------------------
// file: src/components/ui/Button.tsx  – adds *size* prop (xs | sm | md | lg)
// -----------------------------------------------------------------------------
import clsx from "clsx";
import { ButtonHTMLAttributes } from "react";

// -------------------------------
// Variant & Size types
// -------------------------------
export type Variant = "default" | "primary" | "outline" | "secondary" | "ghost";
export type Size = "xs" | "sm" | "md" | "lg" | "icon";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ className, variant = "primary", size = "md", ...props }: Props) {
  // ---------------------------------------------------------
  // Base + size classes (padding & font-size only)
  // ---------------------------------------------------------
  const base =
    "inline-flex items-center justify-center rounded-lg font-medium transition-colors " +
    "focus:outline-none focus:ring-2 focus:ring-offset-2 " +
    "disabled:opacity-50 disabled:pointer-events-none " +
    "ring-offset-white dark:ring-offset-gray-950";

 const sizes: Record<Size, string> = {
  xs: "px-2 py-1 text-xs",
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
  icon: "p-2 w-9 h-9", // або w-10 h-10, залежно від бажаного розміру
};

  const variants: Record<Variant, string> = {
  default:   clsx("bg-gray-900 text-white hover:bg-gray-800"),
  primary:   clsx("bg-gray-800 text-white hover:bg-gray-700"),
  outline:   clsx("border border-gray-500 text-gray-200 hover:bg-gray-800"),
  secondary: clsx("bg-gray-700 text-white hover:bg-gray-600"),
  ghost:     clsx("text-gray-200 hover:bg-gray-800/60"),
};

  return (
    <button
      className={clsx(base, sizes[size], variants[variant], className)}
      {...props}
    />
  );
}
