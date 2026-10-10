import { useState } from "react";
import { useTranslation } from "react-i18next";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface StudentRowMenuProps {
  onEdit: () => void;
  onDelete: () => void;
  // present only while the parent has not set a password yet
  onResendInvite?: () => void;
}

// opens in a portal, so a short table can never clip it
const StudentRowMenu = ({ onEdit, onDelete, onResendInvite }: StudentRowMenuProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const choose = (action: () => void) => () => {
    setOpen(false);
    action();
  };

  const itemClass = "block w-full px-4 py-2 text-left text-sm hover:bg-gray-50";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t("labels.actions")}
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <EllipsisHorizontalIcon className="h-5 w-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={4} className="w-44 overflow-hidden p-0" role="menu">
        <button type="button" role="menuitem" className={`${itemClass} text-gray-700`} onClick={choose(onEdit)}>
          {t("buttons.edit")}
        </button>
        {onResendInvite && (
          <button
            type="button"
            role="menuitem"
            className={`${itemClass} text-gray-700`}
            onClick={choose(onResendInvite)}
          >
            {t("buttons.resend_invite")}
          </button>
        )}
        <button type="button" role="menuitem" className={`${itemClass} text-red-600`} onClick={choose(onDelete)}>
          {t("buttons.delete")}
        </button>
      </PopoverContent>
    </Popover>
  );
};

export default StudentRowMenu;
