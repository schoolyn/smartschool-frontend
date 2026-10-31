import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "@/shared/api";
import { IAPIError, IAxiosResponse } from "@/shared/types";
import { IEnrollmentHistoryEntry } from "../model/types";
import { API_QUERY_KEY, APIS_ROUTES } from "@/shared/lib";

const base = (organizationId: string, studentId: string) =>
  `${APIS_ROUTES.STUDENT_PROFILE}/${organizationId}/student/${studentId}`;

export const useGetEnrollmentHistory = (organizationId: string, studentId: string) =>
  useQuery<{ items: IEnrollmentHistoryEntry[] }, IAPIError>({
    queryKey: ["get-enrollment-history", studentId],
    queryFn: async () => {
      const result = await apiClient.get<null, IAxiosResponse<{ items: IEnrollmentHistoryEntry[] }>>(
        `${base(organizationId, studentId)}/enrollment-history`
      );
      return result.data.Data;
    },
    enabled: !!organizationId && !!studentId,
  });

export const useTransferStudent = (organizationId: string, studentId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, IAPIError, void>({
    mutationFn: async () => {
      await apiClient.put(`${base(organizationId, studentId)}/transfer`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_STUDENT_BY_ID, studentId] });
      queryClient.invalidateQueries({ queryKey: ["get-enrollment-history", studentId] });
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_STUDENT_PROFILE, organizationId] });
    },
  });
};

export const useWithdrawStudent = (organizationId: string, studentId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, IAPIError, void>({
    mutationFn: async () => {
      await apiClient.put(`${base(organizationId, studentId)}/withdraw`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_STUDENT_BY_ID, studentId] });
      queryClient.invalidateQueries({ queryKey: ["get-enrollment-history", studentId] });
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_STUDENT_PROFILE, organizationId] });
    },
  });
};
