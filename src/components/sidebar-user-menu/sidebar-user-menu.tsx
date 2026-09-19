import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  UserCircleIcon,
  BuildingOffice2Icon,
  ArrowRightOnRectangleIcon,
  ChevronUpDownIcon,
  SunIcon,
  MoonIcon,
} from "@heroicons/react/24/outline";

import Avatar from "../avatar";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import { Sheet, SheetTrigger, SheetContent } from "../ui/sheet";
import { useIsMobile } from "@/hooks";
import { useSidebarUserMenuController } from "./sidebar-user-menu-controller";

interface SidebarUserMenuProps {
  isCollapsed: boolean;
}

// shared between the desktop popover and the mobile bottom sheet — only the
// container around this changes based on screen size
const UserMenuBody = ({
  user,
  theme,
  setTheme,
  profilePath,
  isPlatformAdmin,
  handleLogout,
}: ReturnType<typeof useSidebarUserMenuController>) => {
  const { t } = useTranslation();
  if (!user?.name) return null;

  return (
    <>
      <div className="flex items-center gap-2.5 px-2 py-2">
        <Avatar name={user.name} src={user.avatar?.url} size={36} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-900">{user.name}</p>
          <p className="truncate text-xs text-gray-500">{user.email}</p>
        </div>
      </div>

      <div className="my-1 border-t border-gray-100" />

      <Link
        to={profilePath}
        className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-gray-700 hover:bg-gray-50"
      >
        <UserCircleIcon className="h-4 w-4 text-gray-400" />
        {t("labels.your_profile")}
      </Link>

      {isPlatformAdmin && (
        <>
          <Link
            to="/organization"
            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <BuildingOffice2Icon className="h-4 w-4 text-gray-400" />
            Switch Organization
          </Link>
          <Link
            to="/platform"
            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <BuildingOffice2Icon className="h-4 w-4 text-gray-400" />
            Platform Console
          </Link>
        </>
      )}

      <div className="my-1 border-t border-gray-100" />

      <div className="px-2 py-2">
        <p className="mb-1.5 text-xs font-medium text-gray-500">{t("labels.theme")}</p>
        <div className="grid grid-cols-2 gap-1 rounded-md bg-gray-100 dark:bg-gray-950 p-1">
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`flex items-center justify-center gap-1.5 rounded py-1.5 text-sm font-medium transition-colors ${
              theme === "light"
                ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            <SunIcon className="h-4 w-4" />
            {t("common.themes.light")}
          </button>
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`flex items-center justify-center gap-1.5 rounded py-1.5 text-sm font-medium transition-colors ${
              theme === "dark"
                ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            <MoonIcon className="h-4 w-4" />
            {t("common.themes.dark")}
          </button>
        </div>
      </div>

      <div className="my-1 border-t border-gray-100" />

      <button
        type="button"
        onClick={handleLogout}
        className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-gray-700 hover:bg-gray-50"
      >
        <ArrowRightOnRectangleIcon className="h-4 w-4 text-gray-400" />
        {t("labels.sign_out")}
      </button>
    </>
  );
};

const SidebarUserMenu = ({ isCollapsed }: SidebarUserMenuProps) => {
  const { user, ...rest } = useSidebarUserMenuController();
  const isMobile = useIsMobile();

  if (!user?.name) return null;

  const trigger = (
    <button
      type="button"
      className="group flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-2 py-2 shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md"
    >
      <span className="flex items-center min-w-0 -ml-0.5">
        <Avatar name={user.name} src={user.avatar?.url} size={32} />
        <span
          className={`min-w-0 overflow-hidden text-left transition-all duration-300 ease-in-out ${
            isCollapsed ? "max-w-0 opacity-0 ml-0" : "max-w-[9rem] opacity-100 ml-2.5"
          }`}
        >
          <span className="block truncate text-sm font-medium text-gray-900">{user.name}</span>
          <span className="block truncate text-xs text-gray-500 capitalize">{user.role}</span>
        </span>
      </span>
      <ChevronUpDownIcon
        className={`text-gray-400 shrink-0 overflow-hidden transition-all duration-300 ease-in-out ${
          isCollapsed ? "h-4 w-0 opacity-0" : "h-4 w-4 opacity-100"
        }`}
        aria-hidden="true"
      />
    </button>
  );

  return (
    <div className="border-t border-gray-100 p-2">
      {isMobile ? (
        <Sheet>
          <SheetTrigger asChild>{trigger}</SheetTrigger>
          <SheetContent side="bottom" className="p-2">
            <UserMenuBody user={user} {...rest} />
          </SheetContent>
        </Sheet>
      ) : (
        <Popover>
          <PopoverTrigger asChild>{trigger}</PopoverTrigger>
          <PopoverContent side="top" align={isCollapsed ? "center" : "start"}>
            <UserMenuBody user={user} {...rest} />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default SidebarUserMenu;
