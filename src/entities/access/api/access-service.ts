import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "@/shared/api";
import { AccountRole, IAPIError, IAxiosResponse, PermissionKey } from "@/shared/types";
import { API_QUERY_KEY, APIS_ROUTES } from "@/shared/lib";

const base = (organizationId: string) => `${APIS_ROUTES.ACCESS_SERVICE}/${organizationId}`;
const CATALOG_KEY = "get-access-catalog";
const MEMBER_KEY = "get-member-access";

export type StaffRole = "teacher" | "accountant" | "staff";

export interface AccessCatalog {
  permissions: { key: PermissionKey; area: string; label: string; grantableTo: StaffRole[] }[];
  roles: { role: StaffRole; defaults: PermissionKey[]; opsculDefaults: PermissionKey[] }[];
}

export interface MemberAccess {
  userId: string;
  name: string;
  email: string;
  accountStatus: "pending" | "active" | "suspended" | "inactive";
  role: AccountRole | "student";
  status: "active" | "suspended" | "invited" | "inactive";
  permissions: PermissionKey[];
  defaults: PermissionKey[];
}

const getItem = async <T>(url: string) => (await apiClient.get<null, IAxiosResponse<{ item: T }>>(url)).data.Data.item;

export const useAccessCatalog = (organizationId: string) =>
  useQuery<AccessCatalog, IAPIError>({
    queryKey: [CATALOG_KEY, organizationId],
    queryFn: () => getItem(`${base(organizationId)}/catalog`),
    enabled: !!organizationId,
  });

export const useMemberAccess = (organizationId: string, userId: string) =>
  useQuery<MemberAccess, IAPIError>({
    queryKey: [MEMBER_KEY, organizationId, userId],
    queryFn: () => getItem(`${base(organizationId)}/members/${userId}`),
    enabled: !!organizationId && !!userId,
  });

const useMemberMutation = <V>(organizationId: string, userId: string, send: (value: V) => Promise<MemberAccess>) => {
  const queryClient = useQueryClient();
  return useMutation<MemberAccess, IAPIError, V>({
    mutationFn: send,
    onSuccess: (item) => {
      queryClient.setQueryData([MEMBER_KEY, organizationId, userId], (old?: MemberAccess) => ({ ...old, ...item }));
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_ALL_USER, organizationId] });
    },
  });
};

export const useUpdateMemberAccess = (organizationId: string, userId: string) =>
  useMemberMutation<{ role?: AccountRole; permissions?: PermissionKey[] }>(
    organizationId,
    userId,
    async (value) =>
      (
        await apiClient.put<null, IAxiosResponse<{ item: MemberAccess }>>(
          `${base(organizationId)}/members/${userId}`,
          value
        )
      ).data.Data.item
  );

export const useSetMemberStatus = (organizationId: string, userId: string) =>
  useMemberMutation<"active" | "suspended">(
    organizationId,
    userId,
    async (status) =>
      (
        await apiClient.patch<null, IAxiosResponse<{ item: MemberAccess }>>(
          `${base(organizationId)}/members/${userId}/status`,
          { status }
        )
      ).data.Data.item
  );

export const useSetRoleDefaults = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation<AccessCatalog, IAPIError, { role: StaffRole; permissions: PermissionKey[] }>({
    mutationFn: async ({ role, permissions }) =>
      (
        await apiClient.put<null, IAxiosResponse<{ item: AccessCatalog }>>(`${base(organizationId)}/roles/${role}`, {
          permissions,
        })
      ).data.Data.item,
    onSuccess: (item) => {
      queryClient.setQueryData([CATALOG_KEY, organizationId], item);
      queryClient.invalidateQueries({ queryKey: [MEMBER_KEY, organizationId] });
    },
  });
};

export const useReinviteMember = (userId: string) =>
  useMutation<void, IAPIError, void>({
    mutationFn: async () => {
      await apiClient.post(`${APIS_ROUTES.REINVITE_USER}/${userId}`);
    },
  });
