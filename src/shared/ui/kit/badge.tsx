import * as React from "react";

import { cn } from "@/shared/lib/utils";

const TONES = {
  gray: "bg-gray-100 text-gray-700",
  green: "bg-green-100 text-green-800",
  red: "bg-red-100 text-red-800",
  yellow: "bg-yellow-100 text-yellow-800",
  blue: "bg-primary-100 text-primary-800",
} as const;

export type BadgeTone = keyof typeof TONES;

const Badge = ({
  tone = "gray",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) => (
  <span
    className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", TONES[tone], className)}
    {...props}
  />
);

export { Badge };
