import { createContext, useContext, ReactNode } from "react";
import { useParams, Navigate } from "react-router-dom";

import { useAuth } from "./auth-context";
import { useGetAllOrganizations } from "../api/auth-service";
import LogoSpinner from "@/shared/ui/logo-spinner";
import { IOrganization } from "@/entities/organization";
import { ModuleKey, PermissionKey } from "@/shared/types";
import { ALL_MODULES } from "@/shared/lib/modules";
import { homePathFor, UserRole } from "../lib/access";

interface ITenantContext {
  organizationId: string;
  organization: IOrganization | undefined;
  organizations: IOrganization[];
  role: UserRole | undefined;
  permissions: ReadonlySet<PermissionKey>;
  modules: ReadonlySet<ModuleKey>;
}

const TenantContext = createContext<ITenantContext | undefined>(undefined);

// checks the URL's school is the user's and the area matches their role there; a wrong area redirects
export const TenantProvider = ({ children, requiredRole }: { children: ReactNode; requiredRole?: UserRole }) => {
  const { organizationId = "" } = useParams<{ organizationId: string }>();
  const { user } = useAuth();
  const getAllOrganizations = useGetAllOrganizations();

  if (getAllOrganizations.isLoading) {
    return <LogoSpinner />;
  }

  const organizations = getAllOrganizations.data?.items || [];
  const organization = organizations.find((o) => o.id === organizationId);

  // platform admins can access any tenant; resolveTenant() enforces that on the backend
  const isValidTenant = !!organization || !!user?.isPlatformAdmin;

  if (!isValidTenant) {
    return <Navigate to="/not-access" replace />;
  }

  const role = organization?.myRole as UserRole | undefined;
  if (requiredRole && role !== requiredRole) {
    return <Navigate to={role ? homePathFor(organizationId, role) : "/not-access"} replace />;
  }

  const permissions = new Set(organization?.myPermissions ?? []);
  const modules = new Set(organization?.myModules ?? ALL_MODULES);
  return (
    <TenantContext.Provider value={{ organizationId, organization, organizations, role, permissions, modules }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
};

// the signed-in person's role in the current school
export const useCurrentRole = (): UserRole | undefined => useContext(TenantContext)?.role;

// e.g. /org/teacher, so shared pages link within the person's area
export const useAreaBase = () => {
  const tenant = useContext(TenantContext);
  return `/${tenant?.organizationId}/${tenant?.role ?? "admin"}`;
};

export const useCan = () => {
  const permissions = useContext(TenantContext)?.permissions;
  return (...keys: PermissionKey[]) => keys.some((key) => permissions?.has(key));
};

// whether the school's package includes a module
export const useHasModule = () => {
  const modules = useContext(TenantContext)?.modules;
  return (key: ModuleKey) => !modules || modules.has(key);
};
