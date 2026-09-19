import { Outlet } from "react-router-dom";

import Header from "../header";
import Sidebar from "../sidebar";
import { PageHeaderProvider } from "@/context/page-header-context";
import { NotificationProvider } from "@/context/notification-context";
import { useLayoutController } from "./layout-controller";

const Layout = () => {
  const { isSidebarOpen, toggleSidebar, closeSidebar, isCollapsed, toggleCollapse } = useLayoutController();

  return (
    <PageHeaderProvider>
      <NotificationProvider>
        <div className="h-screen flex flex-col">
          <Header onToggleSidebar={toggleSidebar} isCollapsed={isCollapsed} onToggleCollapse={toggleCollapse} />
          <div className="flex flex-1 overflow-hidden relative">
            {/* mobile-only backdrop — tapping it closes the drawer; irrelevant on
                lg+ where the sidebar is a normal in-flow column, not an overlay */}
            {isSidebarOpen && (
              <div
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={closeSidebar}
                aria-hidden="true"
              />
            )}
            <Sidebar isCollapsed={isCollapsed} isMobileOpen={isSidebarOpen} />
            <main className="app-main-surface relative flex-1 overflow-y-auto bg-gray-50">
              <div className="p-6">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      </NotificationProvider>
    </PageHeaderProvider>
  );
};

export default Layout;
