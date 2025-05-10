// -----------------------------------------------------------------------------
// file: src/components/ui/Button.tsx — updated
// • uses *default* import for clsx (correct for the package)
// • adds a "ghost" variant so Header can call <Button variant="ghost" />
// • keeps original variants intact
// -----------------------------------------------------------------------------
import clsx from "clsx";
import { ButtonHTMLAttributes } from "react";

export type Variant = "primary" | "outline" | "secondary" | "ghost"; // added

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ className, variant = "primary", ...props }: Props) {
  const base =
    "px-4 py-2 rounded-lg font-medium transition-colors " +
    "focus:outline-none focus:ring-2 focus:ring-offset-2 " +
    "disabled:opacity-50 disabled:pointer-events-none " +
    "ring-offset-white dark:ring-offset-gray-950";

  const variants: Record<Variant, string> = {
    primary: clsx(
      "bg-gray-800 text-white hover:bg-gray-700",
      "dark:bg-gray-800 dark:hover:bg-gray-700"
    ),

    outline: clsx(
      "border border-gray-500 text-gray-200 hover:bg-gray-800",
      "dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800/50"
    ),

    secondary: clsx(
      "bg-gray-700 text-white hover:bg-gray-600",
      "dark:bg-gray-700 dark:hover:bg-gray-600"
    ),

    ghost: clsx(
      "text-gray-200 hover:bg-gray-800/60",
      "dark:text-gray-300 dark:hover:bg-gray-700/40"
    ),
  };

  return (
    <button className={clsx(base, variants[variant], className)} {...props} />
  );
}
