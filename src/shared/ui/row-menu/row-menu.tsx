import { useState } from "react";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";

import { useModuleLock } from "@/shared/lib/module-lock";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/kit/popover";
import { cn } from "@/shared/lib/utils";

export interface RowMenuItem {
  label: string;
  onSelect: () => void;
  // red text, for actions that switch something off or remove it
  danger?: boolean;
}

interface RowMenuProps {
  items: RowMenuItem[];
  label?: string;
  className?: string;
}

// the "..." actions menu at the end of a table row; it opens in a portal, so a short table can never clip it
const RowMenu = ({ items, label = "Actions", className }: RowMenuProps) => {
  const [open, setOpen] = useState(false);

  // a locked module's rows can't be changed
  const { readOnly } = useModuleLock();
  if (!items.length || readOnly) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
            className
          )}
        >
          <EllipsisVerticalIcon className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={4} className="w-48 overflow-hidden p-0" role="menu">
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            role="menuitem"
            className={cn(
              "block w-full px-4 py-2 text-left text-sm hover:bg-gray-50",
              item.danger ? "text-red-500" : "text-gray-700"
            )}
            onClick={() => {
              setOpen(false);
              item.onSelect();
            }}
          >
            {item.label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
};

export default RowMenu;
