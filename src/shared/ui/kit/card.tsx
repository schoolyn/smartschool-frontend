import * as React from "react";

import { cn } from "@/shared/lib/utils";

// the white panel most pages are built from
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("bg-white rounded-lg shadow p-6", className)} {...props} />
));
Card.displayName = "Card";

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2 ref={ref} className={cn("text-lg font-semibold text-gray-900", className)} {...props} />
  )
);
CardTitle.displayName = "CardTitle";

export { Card, CardTitle };
