import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import PageLoader from "@/shared/ui/page-loader";

import { Header } from "@/widgets/header";
import { Sidebar } from "@/widgets/sidebar";
import { BillingBanner } from "@/widgets/billing-banner";
import { NotificationProvider } from "@/entities/notification";
import { useLayoutController } from "./layout-controller";

const Layout = () => {
  const { isSidebarOpen, closeSidebar } = useLayoutController();

  return (
    <NotificationProvider>
      <div className="h-screen flex flex-col">
        <Header />
        <BillingBanner />
        <div className="flex flex-1 overflow-hidden relative">
          {/* mobile-only backdrop; on lg+ the sidebar is in-flow, not an overlay */}
          {isSidebarOpen && (
            <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={closeSidebar} aria-hidden="true" />
          )}
          <Sidebar />
          <main className="app-main-surface relative flex-1 overflow-y-auto bg-gray-50">
            <div className="p-6">
              <Suspense fallback={<PageLoader />}>
                <Outlet />
              </Suspense>
            </div>
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
};

export default Layout;
