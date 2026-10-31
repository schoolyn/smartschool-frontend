import { Link } from "react-router-dom";
import { Bars3Icon, ArrowLeftIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

import PanelLeftIcon from "@/shared/ui/icons/panel-left-icon";
import { BrandLogo } from "@/features/theme";
import { PANEL_MOTION, panelMotion, revealMotion } from "@/shared/lib/sidebar-motion";
import NotificationBell from "./notification-bell";
import { SupportDialog } from "@/features/support-dialog";
import { useHeaderController } from "../model/header-controller";

const Header = () => {
  const {
    isCollapsed,
    onToggleSidebar,
    onToggleCollapse,
    homePath,
    pageHeaderConfig,
    canAskSupport,
    isAskingSupport,
    setIsAskingSupport,
  } = useHeaderController();

  return (
    <header className="app-shell-surface bg-white z-40">
      <div className="flex h-16">
        {/* brand segment: width matches the sidebar so the divider lines up */}
        <div
          className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} shrink-0 px-3 border-r border-gray-200 ${PANEL_MOTION} ${panelMotion(isCollapsed)} ${
            isCollapsed ? "lg:w-16" : "lg:w-60"
          } w-auto`}
        >
          <button
            type="button"
            className="lg:hidden p-2 -ml-1 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            onClick={onToggleSidebar}
            aria-label="Open menu"
          >
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          <Link
            to={homePath}
            className={`hidden lg:flex flex-1 items-center justify-start overflow-hidden ${revealMotion(isCollapsed)} ${
              isCollapsed ? "max-w-0 pl-0" : "max-w-xs pl-2"
            }`}
          >
            <BrandLogo className="h-7 w-auto max-w-none shrink-0" />
          </Link>
          {isCollapsed ? (
            // collapsed: the brand badge, which turns into the expand control on hover
            <button
              type="button"
              onClick={onToggleCollapse}
              className="group hidden lg:flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <img
                src="/opscul-tile.png"
                alt="Opscul"
                className="h-9 w-9 rounded-lg animate-in fade-in zoom-in-90 duration-300 delay-200 fill-mode-both dark:ring-1 dark:ring-white/15 group-hover:hidden group-focus-visible:hidden"
              />
              <PanelLeftIcon className="hidden h-4 w-4 group-hover:block group-focus-visible:block" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-md text-gray-400 hover:text-primary-600 hover:bg-gray-100 animate-in fade-in duration-300 delay-150 fill-mode-both"
              title="Collapse sidebar"
            >
              <PanelLeftIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* title and back button, set by each page via usePageHeader() */}
        <div className="flex-1 flex items-center justify-between px-4 min-w-0 border-b border-gray-200">
          <div className="flex items-center gap-2 min-w-0">
            {pageHeaderConfig?.onBack && (
              <button
                type="button"
                onClick={pageHeaderConfig.onBack}
                className="p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                title="Back"
              >
                <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
            <h1 className="text-base font-semibold text-gray-900 truncate">{pageHeaderConfig?.title || ""}</h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {canAskSupport && (
              <button
                type="button"
                onClick={() => setIsAskingSupport(true)}
                className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                title="Contact Opscul support"
              >
                <QuestionMarkCircleIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            )}
            <NotificationBell variant="header" />
          </div>
        </div>
      </div>
      {canAskSupport && <SupportDialog open={isAskingSupport} onClose={() => setIsAskingSupport(false)} />}
    </header>
  );
};

export default Header;
