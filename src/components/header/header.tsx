import { Link } from "react-router-dom";
import { Bars3Icon, ArrowLeftIcon } from "@heroicons/react/24/outline";

import PanelLeftIcon from "@/icons/panel-left-icon";
import BrandLogo from "@/components/brand-logo";
import { useHeaderController } from "./header-controller";

interface HeaderProps {
  onToggleSidebar: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Header = ({ onToggleSidebar, isCollapsed, onToggleCollapse }: HeaderProps) => {
  const { homePath, pageHeaderConfig } = useHeaderController();

  return (
    <header className="app-shell-surface bg-white z-40">
      <div className="flex h-16">
        {/* App brand segment — width matches the sidebar so the divider lines up with it */}
        <div
          className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} shrink-0 px-3 border-r border-gray-200 transition-[width] duration-300 ease-in-out ${
            isCollapsed ? "lg:w-16" : "lg:w-56"
          } w-auto`}
        >
          <button
            type="button"
            className="lg:hidden p-2 -ml-1 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            onClick={onToggleSidebar}
          >
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          <Link
            to={homePath}
            className={`hidden lg:flex flex-1 items-center justify-center overflow-hidden transition-all duration-300 ease-in-out ${
              isCollapsed ? "max-w-0 opacity-0" : "max-w-xs opacity-100"
            }`}
          >
            <BrandLogo className="h-7 w-auto shrink-0" />
          </Link>
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-md text-gray-400 hover:text-primary-600 hover:bg-gray-100"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <PanelLeftIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Page header segment — each page registers its own title/back/actions via usePageHeader().
            The user menu used to live at the far right here — it now lives at the bottom of the
            Sidebar instead. */}
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
            <h1 className="text-base font-semibold text-gray-900 truncate">
              {pageHeaderConfig?.title || ""}
            </h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">{pageHeaderConfig?.actions}</div>
        </div>
      </div>
    </header>
  );
};

export default Header;
