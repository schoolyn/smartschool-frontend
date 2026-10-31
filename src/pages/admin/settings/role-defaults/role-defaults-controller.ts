import { useEffect } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useError } from "@/shared/lib/hooks";
import { PermissionKey } from "@/shared/types";
import { type AccessCatalog, type StaffRole, useAccessCatalog, useSetRoleDefaults } from "@/entities/access";
import { RoleDefaultsValues, roleDefaultsSchema } from "../access";

export const ROLE_TITLES: Record<StaffRole, { title: string; hint: string }> = {
  teacher: { title: "Teachers", hint: "Daily classroom work is on by default." },
  accountant: { title: "Accountants", hint: "The fee desk: collecting fees and fee reports." },
  staff: { title: "Staff", hint: "Office staff start with no access; add what your school needs." },
};

const useRoleDefaultsController = () => {
  const { organizationId = "" } = useParams();
  const catalog = useAccessCatalog(organizationId);
  return {
    organizationId,
    catalog: catalog.data,
    isLoading: catalog.isLoading,
    error: catalog.error,
    retry: () => catalog.refetch(),
  };
};

// one role's school-wide defaults
export const useRoleCardController = (
  organizationId: string,
  catalog: AccessCatalog,
  entry: AccessCatalog["roles"][number]
) => {
  const save = useSetRoleDefaults(organizationId);
  useError({ mutation: save });

  const order = catalog.permissions.map((p) => p.key);
  const ordered = (keys: Iterable<PermissionKey>) => {
    const wanted = new Set(keys);
    return order.filter((key) => wanted.has(key));
  };
  const form = useForm<RoleDefaultsValues>({
    resolver: zodResolver(roleDefaultsSchema),
    defaultValues: { permissions: ordered(entry.defaults) },
  });
  const permissions = form.watch("permissions");
  useEffect(() => form.reset({ permissions: ordered(entry.defaults) }), [entry.defaults]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (keys: Iterable<PermissionKey>) => form.setValue("permissions", ordered(keys), { shouldDirty: true });

  return {
    title: ROLE_TITLES[entry.role],
    grantable: catalog.permissions.filter((p) => p.grantableTo.includes(entry.role)),
    selected: new Set(permissions),
    opsculDefaults: new Set(entry.opsculDefaults),
    toggle: (key: PermissionKey, on: boolean) => set(on ? [...permissions, key] : permissions.filter((k) => k !== key)),
    applyOpsculDefaults: () => set(entry.opsculDefaults),
    isDirty: form.formState.isDirty,
    isSaving: save.isPending,
    save: form.handleSubmit((values) =>
      save.mutate(
        { role: entry.role, permissions: values.permissions },
        { onSuccess: () => toast.success(`${ROLE_TITLES[entry.role].title} updated.`) }
      )
    ),
  };
};

export default useRoleDefaultsController;
