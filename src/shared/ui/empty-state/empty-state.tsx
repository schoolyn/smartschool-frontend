import { ReactNode } from "react";

import NoRecordIcon from "@/shared/ui/icons/no-record-icon";
import { cn } from "@/shared/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  // for a small card (a dashboard widget, a details panel): same type, no picture, less space
  compact?: boolean;
  className?: string;
}

// the one empty state for every list in the app: what goes here, and the first step to fill it
const EmptyState = ({ title, description, action, compact = false, className }: EmptyStateProps) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center text-center",
      compact ? "min-h-[10rem] px-4 py-8" : "min-h-[22rem] px-4 py-14",
      className
    )}
  >
    {!compact && (
      <div className="mb-4">
        <NoRecordIcon />
      </div>
    )}
    <h3 className={cn("font-medium text-gray-900", compact ? "text-sm" : "text-base")}>{title}</h3>
    {description && <p className="mt-1 max-w-md text-sm text-gray-500">{description}</p>}
    {action && <div className={compact ? "mt-3" : "mt-5"}>{action}</div>}
  </div>
);

export default EmptyState;
