import { createContext, Dispatch, SetStateAction, useContext, useEffect, useRef } from "react";

import type { Action } from "@/shared/ui/action-buttons";

export interface HeaderActions {
  action?: Action;
  secondaryActions?: Action[];
}

export const ActionsContext = createContext<HeaderActions | null>(null);
export const SetActionsContext = createContext<Dispatch<SetStateAction<HeaderActions | null>> | null>(null);

export const useRegisteredHeaderActions = () => useContext(ActionsContext);

// a tab puts its add button in the page header; clicks always run the latest handler
export const useHeaderActions = ({ action, secondaryActions = [] }: HeaderActions) => {
  const set = useContext(SetActionsContext);
  const latest = useRef<Action[]>([]);
  latest.current = [...(action ? [action] : []), ...secondaryActions];
  const signature = JSON.stringify(
    latest.current.map((a) => [a.label, a.variant, a.title, a.loading, a.disabled, a.hidden])
  );

  useEffect(() => {
    if (!set) return;
    const bind = (a: Action): Action => ({
      ...a,
      onClick: () => latest.current.find((x) => x.label === a.label)?.onClick(),
    });
    set({ action: action && bind(action), secondaryActions: secondaryActions.map(bind) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, set]);

  useEffect(() => () => set?.(null), [set]);
};
