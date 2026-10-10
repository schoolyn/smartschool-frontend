export type UserRole = "admin" | "teacher" | "parent";

// the one place that knows where each role lands after sign-in
export const homePathFor = (organizationId: string | undefined, role: UserRole) =>
  organizationId ? `/${organizationId}/${role}/dashboard` : "/organization";
