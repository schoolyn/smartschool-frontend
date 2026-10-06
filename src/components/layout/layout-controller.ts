import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const COLLAPSE_STORAGE_KEY = 'sidebar_collapsed';

export const useLayoutController = () => {
  // mobile-drawer open/closed state only — on lg+ the sidebar is always visible
  // via CSS regardless of this flag (see Sidebar's lg: classes)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => localStorage.getItem(COLLAPSE_STORAGE_KEY) === 'true');
  const { pathname } = useLocation();

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  useEffect(() => {
    localStorage.setItem(COLLAPSE_STORAGE_KEY, String(isCollapsed));
  }, [isCollapsed]);

  // a nav click should close the mobile drawer — harmless no-op on desktop,
  // where the sidebar's visibility doesn't depend on this flag at all
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  return {
    isSidebarOpen,
    toggleSidebar,
    closeSidebar,
    isCollapsed,
    toggleCollapse,
  };
};
