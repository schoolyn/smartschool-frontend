import { ComponentType, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BellIcon,
  BuildingOffice2Icon,
  CreditCardIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

import { useAreaBase, useCan, useCurrentRole } from "@/entities/session";
import { PermissionKey } from "@/shared/types";

type SettingsTab = {
  path: string;
  label?: string;
  labelKey?: string;
  icon: ComponentType;
  anyOf?: PermissionKey[];
  adminOnly?: boolean;
};

export const SETTINGS_TABS: SettingsTab[] = [
  { path: "profile", labelKey: "labels.profile", icon: UserCircleIcon },
  { path: "school", label: "School", icon: BuildingOffice2Icon, anyOf: ["school.settings"] },
  { path: "add-user", labelKey: "labels.user_management", icon: UsersIcon, anyOf: ["people.manage"] },
  { path: "roles", label: "Roles", icon: ShieldCheckIcon, adminOnly: true },
  { path: "notifications", labelKey: "labels.notifications", icon: BellIcon, anyOf: ["school.settings"] },
  { path: "online-payments", label: "Online payments", icon: CreditCardIcon, anyOf: ["fees.setup"] },
];

const useUserManagementController = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const areaBase = useAreaBase();
  const can = useCan();
  const isAdmin = useCurrentRole() === "admin";

  const tabs = SETTINGS_TABS.filter((tab) => (tab.adminOnly ? isAdmin : !tab.anyOf || can(...tab.anyOf)));
  const activePath = tabs.find((tab) => location.pathname.includes(`/settings/${tab.path}`))?.path;

  useEffect(() => {
    if (!activePath) navigate(`${areaBase}/settings/${tabs[0].path}`, { replace: true });
  }, [activePath, navigate, areaBase, tabs]);

  const handleTabChange = (path: string) => {
    if (path !== activePath) navigate(`${areaBase}/settings/${path}`);
  };

  const tabLabel = (tab: (typeof SETTINGS_TABS)[number]) => (tab.labelKey ? t(tab.labelKey) : tab.label);

  return { tabs, activePath: activePath ?? "profile", handleTabChange, tabLabel };
};

export default useUserManagementController;
