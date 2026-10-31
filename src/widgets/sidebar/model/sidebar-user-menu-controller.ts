import { useLayoutStore } from "@/shared/model/layout-store";
import { useParams } from "react-router-dom";

import { useAuth } from "@/entities/session";
import { useCurrentRole } from "@/entities/session";
import { useTheme } from "@/features/theme";

export const useSidebarUserMenuController = () => {
  const { organizationId } = useParams();
  const { user, logout } = useAuth();
  // the role in the current school decides the menus and links
  const role = useCurrentRole();
  const { theme, setTheme } = useTheme();

  // an admin's profile lives in Settings
  const profilePath = role === "admin" ? `/${organizationId}/admin/settings` : `/${organizationId}/${role}/profile`;
  const supportPath = role && role !== "parent" ? `/${organizationId}/${role}/support` : "";

  const handleLogout = () => {
    try {
      logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return {
    isCollapsed: useLayoutStore((state) => state.isCollapsed),
    user,
    role,
    theme,
    setTheme,
    profilePath,
    supportPath,
    isPlatformAdmin: !!user?.isPlatformAdmin,
    handleLogout,
  };
};
