import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  current: "bg-green-100 text-green-800",
  active: "bg-gray-100 text-gray-700",
  draft: "bg-amber-100 text-amber-800",
  closed: "bg-gray-200 text-gray-600",
  inactive: "bg-red-50 text-red-700",
};

const LABELS: Record<string, string> = {
  current: "Current",
  active: "Active",
  draft: "Draft",
  closed: "Closed",
  inactive: "Inactive",
};

// one look for every record status in the app: a small pill, with unknown statuses shown as they are
const StatusBadge = ({ status, className }: { status: string; className?: string }) => (
  <span
    className={cn(
      "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium",
      STYLES[status] ?? "bg-gray-100 text-gray-700",
      className,
    )}
  >
    {LABELS[status] ?? status}
  </span>
);

export default StatusBadge;
