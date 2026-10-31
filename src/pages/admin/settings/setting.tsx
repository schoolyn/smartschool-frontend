import { Routes, Route, Navigate } from "react-router-dom";

import UserManagement from "./user-management";
import AdminProfile from "./profile";
import UserDetails from "./user-details";
import Notifications from "./notifications";
import OnlinePayments from "./online-payments";
import MemberAccess from "./member-access";
import RoleDefaults from "./role-defaults";
import SchoolSettings from "./school";
import { ModuleGate } from "@/widgets/module-gate";

const Settings = () => {
  return (
    <Routes>
      <Route path="/" element={<UserManagement />}>
        <Route index element={<Navigate to="profile" replace />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="school" element={<SchoolSettings />} />
        <Route path="add-user" element={<UserDetails />} />
        <Route path="add-user/:userId" element={<MemberAccess />} />
        <Route path="roles" element={<RoleDefaults />} />
        <Route path="notifications" element={<Notifications />} />
        <Route
          path="online-payments"
          element={
            <ModuleGate module="onlinePayments">
              <OnlinePayments />
            </ModuleGate>
          }
        />
      </Route>
    </Routes>
  );
};

export default Settings;
