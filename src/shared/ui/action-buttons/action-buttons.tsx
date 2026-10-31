import { ComponentType } from "react";

import { useModuleLock } from "@/shared/lib/module-lock";
import RowMenu from "@/shared/ui/row-menu";
import { Button } from "@/shared/ui/kit/button";

export interface Action {
  label: string;
  onClick: () => void;
  icon?: ComponentType<{ className?: string }>;
  variant?: "primary" | "secondary" | "danger";
  title?: string;
  loading?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  menu?: boolean;
  readOnlySafe?: boolean;
}

// a row of buttons described as data, so headers and tables draw them the same way
const ActionButtons = ({ actions, variant = "secondary" }: { actions: Action[]; variant?: Action["variant"] }) => {
  const { readOnly } = useModuleLock();
  const shown = actions.filter((action) => !action.hidden && (!readOnly || action.readOnlySafe));
  const inMenu = shown.filter((action) => action.menu && !action.disabled);

  return (
    <>
      <RowMenu
        label="More actions"
        className="h-9 w-9"
        items={inMenu.map((action) => ({
          label: action.label,
          onSelect: action.onClick,
          danger: action.variant === "danger",
        }))}
      />
      {shown
        .filter((action) => !action.menu)
        .map(({ label, onClick, icon: Icon, loading, disabled, title, variant: own }) => (
          <Button
            key={label}
            variant={own ?? variant}
            onClick={onClick}
            loading={loading}
            disabled={disabled}
            title={title}
          >
            {Icon && !loading && <Icon className="h-4 w-4" />}
            {label}
          </Button>
        ))}
    </>
  );
};

export default ActionButtons;
