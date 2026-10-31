import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import apiClient from "@/shared/api";
import { IAPIError, IAxiosResponse } from "@/shared/types";
import { ILeaveRequest } from "../model/types";
import { APIS_ROUTES, API_QUERY_KEY, API_MUTATION_KEY } from "@/shared/lib";

const base = (organizationId: string) => `${APIS_ROUTES.LEAVE_SERVICE}/${organizationId}`;

export const useGetMyLeaveRequests = (organizationId: string) =>
  useQuery<{ items: ILeaveRequest[] }, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_MY_LEAVE_REQUESTS, organizationId],
    queryFn: async () => {
      const result = await apiClient.get<null, IAxiosResponse<{ items: ILeaveRequest[] }>>(
        `${base(organizationId)}/my-requests`
      );
      return result.data.Data;
    },
    enabled: !!organizationId,
  });

export const useCreateLeaveRequest = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation<ILeaveRequest, IAPIError, FormData>({
    mutationKey: [API_MUTATION_KEY.CREATE_LEAVE_REQUEST],
    mutationFn: async (data) => {
      const result = await apiClient.post<FormData, IAxiosResponse<{ item: ILeaveRequest }>>(
        `${base(organizationId)}/create`,
        data
      );
      return result.data.Data.item;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_MY_LEAVE_REQUESTS, organizationId] }),
  });
};

export const useCancelLeaveRequest = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, IAPIError, string>({
    mutationKey: [API_MUTATION_KEY.CANCEL_LEAVE_REQUEST],
    mutationFn: async (leaveRequestId) => {
      await apiClient.post(`${base(organizationId)}/${leaveRequestId}/cancel`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_MY_LEAVE_REQUESTS, organizationId] }),
  });
};
