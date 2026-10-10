import { ReactNode } from "react";
import Cookies from "js-cookie";
import { Navigate } from "react-router-dom";

import { USER_ACCESS_KEY } from "../utils";
import { useAuth } from "../context/auth-context";
import { TenantProvider } from "../context/tenant-context";
import useIsMobile from "../hooks/is-mobile/is-mobile";
import MobileNotice from "../components/mobile-notice";
import { homePathFor, UserRole } from "./access";

interface RouteGuardProps {
  children: ReactNode;
}

interface ProtectedRouteProps extends RouteGuardProps {
  role: UserRole;
}

// Access policy, applied the same way everywhere:
//   signed out                -> /login
//   signed in, wrong role     -> /not-access (a 403, not a silent redirect)
//   signed in, right role     -> page (the backend still enforces every request)
// The user comes from AuthProvider, which has already verified the session with the server.

// signed-in visitors skip public pages (login and the like) and land on their dashboard
export const PublicRoute = ({ children }: RouteGuardProps) => {
  const { user } = useAuth();

  if (user?.role) {
    return <Navigate to={homePathFor(Cookies.get(USER_ACCESS_KEY.ORGANIZATION_ID), user.role)} replace />;
  }

  return <>{children}</>;
};

// any signed-in role (organization picker)
export const AuthenticatedRoute = ({ children }: RouteGuardProps) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

export const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/not-access" replace />;

  // the signed-in app is not responsive yet, so phones get a notice for now
  if (isMobile) return <MobileNotice />;

  // role checked out; TenantProvider still has to confirm the URL's :organizationId is real
  return <TenantProvider>{children}</TenantProvider>;
};

export const PlatformRoute = ({ children }: RouteGuardProps) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (!user.isPlatformAdmin) return <Navigate to="/not-access" replace />;

  return <>{children}</>;
};

// unknown URLs: a signed-out visitor should land on login, not an "access denied" page
export const FallbackRoute = () => {
  const { user } = useAuth();

  return <Navigate to={user ? "/not-access" : "/login"} replace />;
};
