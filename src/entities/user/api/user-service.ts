import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import apiClient from "@/shared/api";
import { IAPIError, IAxiosResponse, Paged } from "@/shared/types";
import { IAddUserValue, IAllUserDetails, IUpdateUserValue } from "../model/types";
import { API_MUTATION_KEY, API_QUERY_KEY, APIS_ROUTES } from "@/shared/lib";

const addUser = async (organizationId: string, addUserValue: IAddUserValue) => {
  await apiClient.post(`${APIS_ROUTES.ADD_USER}/${organizationId}`, addUserValue);
};

export const useAddUserDetail = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, IAPIError, IAddUserValue>({
    mutationKey: [API_MUTATION_KEY.ADD_USER],
    mutationFn: (addUserValue) => addUser(organizationId, addUserValue),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_ALL_USER, organizationId] });
    },
  });
};

// the server says whether the account was deleted or only taken out of this school (they belong to another)
const deleteUser = async (organizationId: string, userId: string) => {
  const result = await apiClient.delete<null, IAxiosResponse<{ message: string }>>(
    `${APIS_ROUTES.DELETE_USER}/${organizationId}/user/${userId}`
  );
  return result.data.Data.message;
};

export const useDeleteUser = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation<string, IAPIError, string>({
    mutationKey: [API_MUTATION_KEY.DELETE_USER],
    mutationFn: (userId) => deleteUser(organizationId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_ALL_USER, organizationId] });
    },
  });
};

const getAllUserDetails = async (
  organizationId: string,
  searchTerm: string,
  filterRole: string,
  page: number,
  limit: number
): Promise<Paged<IAllUserDetails>> => {
  const result = await apiClient.get<null, IAxiosResponse<Paged<IAllUserDetails>>>(
    `${APIS_ROUTES.GET_ALL_USER}/${organizationId}`,
    {
      params: {
        search_term: searchTerm,
        role: filterRole,
        page,
        limit,
      },
    }
  );

  return result.data.Data;
};

export const useGetAllUserDetails = (
  organizationId: string,
  searchTerm: string,
  filterRole: string,
  page: number,
  pageSize: number
) =>
  useQuery<Paged<IAllUserDetails>, IAPIError>({
    // org and filters are in the key, so a tenant or filter switch is a new cache entry, no manual refetch
    queryKey: [API_QUERY_KEY.GET_ALL_USER, organizationId, searchTerm, filterRole, page, pageSize],
    queryFn: () => getAllUserDetails(organizationId, searchTerm, filterRole, page, pageSize),
    enabled: !!organizationId,
  });

const updateUser = async (updateUserValue: IUpdateUserValue) => {
  await apiClient.put(`${APIS_ROUTES.UPDATE_USER_DETAILS}/${updateUserValue.id}`, updateUserValue);
};

export const useUpdateUserDetail = (organizationId?: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, IAPIError, IUpdateUserValue>({
    mutationKey: [API_MUTATION_KEY.UPDATE_USER_DETAILS],
    mutationFn: updateUser,
    onSuccess: () => {
      if (organizationId) {
        queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_ALL_USER, organizationId] });
      }
    },
  });
};
