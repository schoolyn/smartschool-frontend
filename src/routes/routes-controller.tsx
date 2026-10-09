import React from "react";
import Cookies from "js-cookie";
import { USER_ACCESS_KEY } from "../utils";
import { Navigate } from "react-router-dom";
import { TenantProvider } from "../context/tenant-context";

interface PublicRouteProps {
  children: React.ReactNode;
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  role: "admin" | "parent" | "teacher";
}

const useRoutesController = () => {
  const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
    const token = Cookies.get(USER_ACCESS_KEY.TOKEN);
    const user_role = Cookies.get(USER_ACCESS_KEY.ROLE);
    const organizationId = Cookies.get(USER_ACCESS_KEY.ORGANIZATION_ID);

    if (token && user_role) {
      // no organizationId here 404s into /not-access — send to the picker instead if none is set yet
      return organizationId ? (
        <Navigate to={`/${organizationId}/${user_role}/dashboard`} replace />
      ) : (
        <Navigate to="/organization" replace />
      );
    }

    return <>{children}</>;
  };

  const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
    const token = Cookies.get(USER_ACCESS_KEY.TOKEN);
    const user_role = Cookies.get(USER_ACCESS_KEY.ROLE);

    if (!token || user_role !== role) {
      return <Navigate to="/login" replace />;
    }

    // role checked out; TenantProvider still has to confirm the URL's :organizationId is real
    return <TenantProvider>{children}</TenantProvider>;
  };

  // unknown URLs: a signed-out visitor should land on login, not an "access denied" page
  const FallbackRoute: React.FC = () => {
    const token = Cookies.get(USER_ACCESS_KEY.TOKEN);
    return <Navigate to={token ? "/not-access" : "/login"} replace />;
  };

  return {
    PublicRoute,
    ProtectedRoute,
    FallbackRoute,
  };
};

export default useRoutesController;
