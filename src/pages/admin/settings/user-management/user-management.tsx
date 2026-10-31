import { Outlet } from "react-router-dom";

import SectionHeader, { HeaderActionsProvider } from "@/shared/ui/section-header";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/kit/tabs";
import useUserManagementController from "./user-management-controller";

const UserManagement = () => {
  const { tabs, activePath, handleTabChange, tabLabel } = useUserManagementController();

  return (
    <HeaderActionsProvider>
      <div className="max-w-7xl mx-auto">
        <SectionHeader title="Settings" description="Your profile, the school's people, their roles and access" />

        <Tabs value={activePath} onValueChange={handleTabChange} className="mb-4">
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.path} value={tab.path}>
                <tab.icon />
                {tabLabel(tab)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Outlet />
      </div>
    </HeaderActionsProvider>
  );
};

export default UserManagement;
