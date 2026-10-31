import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/shared/lib/utils";
import ButtonSpinner from "@/shared/ui/icons/button-spinner";

const VARIANTS = {
  primary:
    "border border-transparent bg-primary-600 text-white shadow-sm hover:bg-primary-700 focus-visible:ring-primary-500",
  secondary: "border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 focus-visible:ring-primary-500",
  danger: "border border-transparent bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-500",
  ghost: "border border-transparent text-gray-700 hover:bg-gray-100 focus-visible:ring-primary-500",
  link: "border-0 p-0 text-primary-600 hover:text-primary-800 focus-visible:ring-primary-500",
} as const;

const SIZES = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  icon: "p-2",
} as const;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  loading?: boolean;
  asChild?: boolean;
}

// the one button for the app; variants match the colours every screen already used
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      asChild = false,
      disabled,
      children,
      type,
      ...props
    },
    ref
  ) => {
    const classes = cn(
      "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      VARIANTS[variant],
      variant !== "link" && SIZES[size],
      variant === "link" && "text-sm",
      className
    );
    if (asChild)
      return (
        <Slot ref={ref} className={classes} {...props}>
          {children}
        </Slot>
      );
    return (
      <button ref={ref} type={type ?? "button"} className={classes} disabled={disabled || loading} {...props}>
        {loading && <ButtonSpinner />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
