import { useMutation, useQueryClient } from "@tanstack/react-query";

import apiClient from "@/shared/api";
import { IAPIError, IAxiosResponse } from "@/shared/types";
import { IAddGuardianValue } from "../model/types";
import { API_QUERY_KEY, APIS_ROUTES } from "@/shared/lib";

const base = (organizationId: string, studentId: string) =>
  `${APIS_ROUTES.STUDENT_PROFILE}/${organizationId}/student/${studentId}/guardian`;

// `invited` tells whether a new parent was emailed an invite to set their password
export const useAddGuardian = (organizationId: string, studentId: string) => {
  const queryClient = useQueryClient();
  return useMutation<{ invited: boolean }, IAPIError, IAddGuardianValue>({
    mutationFn: async (value) => {
      const result = await apiClient.post<null, IAxiosResponse<{ invited: boolean }>>(
        base(organizationId, studentId),
        value
      );
      return result.data.Data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_STUDENT_BY_ID, studentId] }),
  });
};

export const useSetPrimaryGuardian = (organizationId: string, studentId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, IAPIError, string>({
    mutationFn: async (guardianLinkId) => {
      await apiClient.put(`${base(organizationId, studentId)}/${guardianLinkId}`, { isPrimaryGuardian: true });
    },
    // the primary guardian is the parent the student list and export show
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_STUDENT_BY_ID, studentId] });
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_STUDENT_PROFILE, organizationId] });
    },
  });
};

export const useRemoveGuardian = (organizationId: string, studentId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, IAPIError, string>({
    mutationFn: async (guardianLinkId) => {
      await apiClient.delete(`${base(organizationId, studentId)}/${guardianLinkId}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_STUDENT_BY_ID, studentId] }),
  });
};
