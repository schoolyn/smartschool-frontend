import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import apiClient from "@/shared/api";
import { IAPIError, IAxiosResponse } from "@/shared/types";
import { ILeaveRequest } from "../model/types";
import { APIS_ROUTES, API_QUERY_KEY, API_MUTATION_KEY } from "@/shared/lib";

const base = (organizationId: string) => `${APIS_ROUTES.LEAVE_SERVICE}/${organizationId}`;

export const useGetLeaveRequestsReviewQueue = (organizationId: string, status: string) =>
  useQuery<{ items: ILeaveRequest[] }, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_LEAVE_REQUESTS_REVIEW_QUEUE, organizationId, status],
    queryFn: async () => {
      const result = await apiClient.get<null, IAxiosResponse<{ items: ILeaveRequest[] }>>(
        `${base(organizationId)}/review-queue`,
        {
          params: status ? { status } : {},
        }
      );
      return result.data.Data;
    },
    enabled: !!organizationId,
  });

interface DecideVariables {
  leaveRequestId: string;
  status: "approved" | "rejected";
  decisionNote?: string;
}

export const useDecideLeaveRequest = (organizationId: string, status: string) => {
  const queryClient = useQueryClient();
  return useMutation<ILeaveRequest, IAPIError, DecideVariables>({
    mutationKey: [API_MUTATION_KEY.DECIDE_LEAVE_REQUEST],
    mutationFn: async ({ leaveRequestId, status: decision, decisionNote }) => {
      const result = await apiClient.post<
        { status: string; decisionNote?: string },
        IAxiosResponse<{ item: ILeaveRequest }>
      >(`${base(organizationId)}/${leaveRequestId}/decide`, {
        status: decision,
        decisionNote,
      });
      return result.data.Data.item;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [API_QUERY_KEY.GET_LEAVE_REQUESTS_REVIEW_QUEUE, organizationId, status],
      });
      queryClient.invalidateQueries({
        queryKey: [API_QUERY_KEY.GET_ATTENTION, organizationId],
      });
    },
  });
};
