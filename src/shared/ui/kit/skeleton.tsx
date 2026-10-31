import * as React from "react";

import { cn } from "@/shared/lib/utils";

// a placeholder shaped like the loading content, so the layout doesn't jump when data arrives
const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("animate-pulse rounded-md bg-gray-200", className)} {...props} />
);

export { Skeleton };
