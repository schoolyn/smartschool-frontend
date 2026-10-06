import { Outlet } from "react-router-dom";

import SectionHeader from "@/components/section-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useUserManagementController from "./user-management-controller";

const UserManagement = () => {
  const { t, selectedIndex, handleTabChange } = useUserManagementController();

  return (
    <div className="max-w-7xl mx-auto">
      <SectionHeader title="Settings" description="Manage your profile, school users and their roles" />

      <div className="mb-4">
        <Tabs value={String(selectedIndex)} onValueChange={(value) => handleTabChange(Number(value))}>
          <TabsList>
            <TabsTrigger value="0">{t("labels.profile")}</TabsTrigger>
            <TabsTrigger value="1">{t("labels.user_management")}</TabsTrigger>
            <TabsTrigger value="2">{t("labels.notifications")}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Outlet />
    </div>
  );
};

export default UserManagement;
