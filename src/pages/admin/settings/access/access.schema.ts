import { z } from "zod";

import { PermissionKey } from "@/shared/types";

const permissionList = z.array(z.custom<PermissionKey>((value) => typeof value === "string"));

export const memberAccessSchema = z.object({
  role: z.enum(["admin", "teacher", "accountant", "staff", "parent", "student"]),
  permissions: permissionList,
});
export type MemberAccessValues = z.infer<typeof memberAccessSchema>;

export const roleDefaultsSchema = z.object({ permissions: permissionList });
export type RoleDefaultsValues = z.infer<typeof roleDefaultsSchema>;
