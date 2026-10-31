import { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "@/entities/session";
import { TenantProvider } from "@/entities/session";
import useIsMobile from "@/shared/lib/hooks/is-mobile/is-mobile";
import { MobileNotice } from "@/widgets/mobile-notice";
import { UserRole } from "@/entities/session";

interface RouteGuardProps {
  children: ReactNode;
}

interface ProtectedRouteProps extends RouteGuardProps {
  role: UserRole;
}

// signed out -> /login, wrong role -> /not-access (403), right role -> page; backend still enforces

// signed-in visitors skip public pages; the school picker opens their school in their role
export const PublicRoute = ({ children }: RouteGuardProps) => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/organization" replace />;
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

  // the signed-in app is not responsive yet, so phones get a notice for now
  if (isMobile) return <MobileNotice />;

  // the role is per school, so TenantProvider checks it once it knows which school the URL is for
  return <TenantProvider requiredRole={role}>{children}</TenantProvider>;
};

// unknown URLs: a signed-out visitor should land on login, not an "access denied" page
export const FallbackRoute = () => {
  const { user } = useAuth();

  return <Navigate to={user ? "/not-access" : "/login"} replace />;
};
