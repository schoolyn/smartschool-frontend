import type { AccountRole } from "@/shared/types";

export type UserRole = AccountRole;

// accountants and staff land on their first permitted page
export const homePathFor = (organizationId: string | undefined, role: UserRole) =>
  !organizationId
    ? "/organization"
    : role === "accountant" || role === "staff"
      ? `/${organizationId}/${role}`
      : `/${organizationId}/${role}/dashboard`;
