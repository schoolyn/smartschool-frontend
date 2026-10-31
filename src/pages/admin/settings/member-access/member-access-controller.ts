import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAuth } from "@/entities/session";
import { useAreaBase, useCurrentRole } from "@/entities/session";
import { useError } from "@/shared/lib/hooks";
import { AccountRole, PermissionKey } from "@/shared/types";
import {
  type StaffRole,
  useAccessCatalog,
  useMemberAccess,
  useReinviteMember,
  useSetMemberStatus,
  useUpdateMemberAccess,
} from "@/entities/access";
import { MemberAccessValues, ROLE_OPTIONS, memberAccessSchema } from "../access";

const STAFF: MemberAccessValues["role"][] = ["teacher", "accountant", "staff"];

const useMemberAccessController = () => {
  const { organizationId = "", userId = "" } = useParams();
  const areaBase = useAreaBase();
  const { user } = useAuth();
  const actorIsAdmin = useCurrentRole() === "admin";

  const catalog = useAccessCatalog(organizationId);
  const member = useMemberAccess(organizationId, userId);
  const update = useUpdateMemberAccess(organizationId, userId);
  const setStatus = useSetMemberStatus(organizationId, userId);
  const reinvite = useReinviteMember(userId);
  useError({ mutation: update });
  useError({ mutation: setStatus });
  useError({ mutation: reinvite });

  const form = useForm<MemberAccessValues>({
    resolver: zodResolver(memberAccessSchema),
    defaultValues: { role: "teacher", permissions: [] },
  });
  const role = form.watch("role");
  const permissions = form.watch("permissions");
  const [confirmStatus, setConfirmStatus] = useState(false);

  // in the catalog's order, so the same set always compares equal
  const ordered = (keys: Iterable<PermissionKey>) => {
    const wanted = new Set(keys);
    return (catalog.data?.permissions ?? []).map((p) => p.key).filter((key) => wanted.has(key));
  };
  const defaultsFor = (r: MemberAccessValues["role"]) =>
    catalog.data?.roles.find((entry) => entry.role === r)?.defaults ?? [];

  useEffect(() => {
    if (member.data && catalog.data)
      form.reset({ role: member.data.role, permissions: ordered(member.data.permissions) });
  }, [member.data, catalog.data]); // eslint-disable-line react-hooks/exhaustive-deps

  const isStaffRole = STAFF.includes(role);
  const lockedReason =
    userId === user?.id
      ? "This is your own account. Another admin has to change your role or access."
      : member.data?.role === "admin" && !actorIsAdmin
        ? "Only a school admin can change an admin."
        : "";

  const changeRole = (next: AccountRole) => {
    form.setValue("role", next, { shouldDirty: true });
    form.setValue("permissions", ordered(defaultsFor(next)), { shouldDirty: true });
  };

  const toggle = (key: PermissionKey, on: boolean) =>
    form.setValue("permissions", ordered(on ? [...permissions, key] : permissions.filter((k) => k !== key)), {
      shouldDirty: true,
    });

  const save = form.handleSubmit((values) =>
    update.mutate(
      {
        role: values.role === "student" ? undefined : values.role,
        permissions: STAFF.includes(values.role) ? values.permissions : undefined,
      },
      { onSuccess: () => toast.success("Access saved.") }
    )
  );

  const suspended = member.data?.status === "suspended";
  const toggleStatus = () =>
    setStatus.mutate(suspended ? "active" : "suspended", {
      onSuccess: () => toast.success(suspended ? "Reactivated." : "Suspended in this school."),
      onSettled: () => setConfirmStatus(false),
    });

  return {
    backTo: `${areaBase}/settings/add-user`,
    member: member.data,
    isLoading: catalog.isLoading || member.isLoading,
    loadError: catalog.error ?? member.error,
    retry: () => {
      catalog.refetch();
      member.refetch();
    },
    role,
    roleChoices: ROLE_OPTIONS.filter((option) => actorIsAdmin || option.value !== "admin"),
    changeRole,
    isStaffRole,
    grantable: (catalog.data?.permissions ?? []).filter(
      (p) => isStaffRole && p.grantableTo.includes(role as StaffRole)
    ),
    selected: new Set(permissions),
    defaults: new Set(defaultsFor(role)),
    toggle,
    resetToDefaults: () => form.setValue("permissions", ordered(defaultsFor(role)), { shouldDirty: true }),
    discard: () => form.reset(),
    lockedReason,
    suspended,
    isDirty: form.formState.isDirty,
    save,
    isSaving: update.isPending,
    confirmStatus,
    setConfirmStatus,
    toggleStatus,
    isChangingStatus: setStatus.isPending,
    resendInvite: () => reinvite.mutate(undefined, { onSuccess: () => toast.success("Invite sent again.") }),
    isResending: reinvite.isPending,
  };
};

export default useMemberAccessController;
