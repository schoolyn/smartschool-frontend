import ActionButtons, { Action } from "@/shared/ui/action-buttons";
import { useRegisteredHeaderActions } from "./header-actions-context";

interface SectionHeaderProps {
  title: string;
  description?: string;
  // the page's main create/add button, on the right
  action?: Action;
  // page-level extras beside it, drawn as secondary buttons
  secondaryActions?: Action[];
  className?: string;
}

// the top of every page: title and description on the left, its buttons on the right
const SectionHeader = ({
  title,
  description,
  action: ownAction,
  secondaryActions: ownSecondary,
  className = "",
}: SectionHeaderProps) => {
  const registered = useRegisteredHeaderActions();
  const action = ownAction ?? registered?.action;
  const secondaryActions = ownSecondary ?? registered?.secondaryActions ?? [];
  const hasActions = [action, ...secondaryActions].some((a) => a && !a.hidden);
  return (
    <div className={`mb-6 flex flex-wrap items-start justify-between gap-4 ${className}`}>
      <div className="min-w-0">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      {hasActions && (
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <ActionButtons actions={secondaryActions} />
          {action && <ActionButtons actions={[action]} variant="primary" />}
        </div>
      )}
    </div>
  );
};

export default SectionHeader;
