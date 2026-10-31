import { ReactNode, useState } from "react";

import { ActionsContext, HeaderActions, SetActionsContext } from "./header-actions-context";

// wrap a tabbed page: its SectionHeader shows the buttons the open tab registers
const HeaderActionsProvider = ({ children }: { children: ReactNode }) => {
  const [actions, setActions] = useState<HeaderActions | null>(null);
  return (
    <SetActionsContext.Provider value={setActions}>
      <ActionsContext.Provider value={actions}>{children}</ActionsContext.Provider>
    </SetActionsContext.Provider>
  );
};

export default HeaderActionsProvider;
