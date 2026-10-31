import { useLayoutStore } from "@/shared/model/layout-store";
import { useState } from "react";
import { useParams } from "react-router-dom";

import { useCurrentRole } from "@/entities/session";
import { usePageHeaderStore } from "@/shared/model/page-header-store";
import { homePathFor } from "@/entities/session";

export const useHeaderController = () => {
  const { organizationId } = useParams();
  // the role in the current school decides the menus and links
  const role = useCurrentRole();
  const pageHeaderConfig = usePageHeaderStore((state) => state.config);

  const homePath = role ? homePathFor(organizationId, role) : "/organization";

  // staff only; parents ask their school
  const canAskSupport = !!role && role !== "parent";
  const [isAskingSupport, setIsAskingSupport] = useState(false);

  const isCollapsed = useLayoutStore((state) => state.isCollapsed);
  const onToggleSidebar = useLayoutStore((state) => state.toggleSidebar);
  const onToggleCollapse = useLayoutStore((state) => state.toggleCollapse);

  return {
    isCollapsed,
    onToggleSidebar,
    onToggleCollapse,
    homePath,
    pageHeaderConfig,
    canAskSupport,
    isAskingSupport,
    setIsAskingSupport,
  };
};
