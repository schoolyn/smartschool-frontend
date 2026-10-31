import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { useLayoutStore } from "@/shared/model/layout-store";

export const useLayoutController = () => {
  const isSidebarOpen = useLayoutStore((state) => state.isSidebarOpen);
  const closeSidebar = useLayoutStore((state) => state.closeSidebar);
  const { pathname } = useLocation();

  // close the mobile drawer on nav; a no-op on desktop
  useEffect(() => {
    closeSidebar();
  }, [pathname, closeSidebar]);

  return { isSidebarOpen, closeSidebar };
};
