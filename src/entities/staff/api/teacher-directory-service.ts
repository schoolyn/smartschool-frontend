import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import apiClient from "@/shared/api";
import { IAPIError, IAxiosResponse } from "@/shared/types";
import { ITeacherDirectoryEntry, IStaffProfile } from "../model/types";
import { APIS_ROUTES, API_QUERY_KEY } from "@/shared/lib";

export const useGetTeacherDirectory = (organizationId: string) =>
  useQuery<{ items: ITeacherDirectoryEntry[] }, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_TEACHER_DIRECTORY, organizationId],
    queryFn: async () => {
      const result = await apiClient.get<null, IAxiosResponse<{ items: ITeacherDirectoryEntry[] }>>(
        `${APIS_ROUTES.STAFF_SERVICE}/${organizationId}/teacher`
      );
      return result.data.Data;
    },
    enabled: !!organizationId,
  });

interface IUpsertStaffProfileValue {
  userId: string;
  employeeCode?: string;
  designation?: string;
  department?: string;
  qualification?: string;
  dateOfJoining?: string;
  dateOfBirth?: string;
  address?: string;
}

export const useUpsertStaffProfile = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation<IStaffProfile, IAPIError, IUpsertStaffProfileValue>({
    mutationFn: async (value) => {
      const { userId, ...rest } = value;
      const result = await apiClient.put<null, IAxiosResponse<{ item: IStaffProfile }>>(
        `${APIS_ROUTES.STAFF_SERVICE}/${organizationId}/staff-profile/${userId}`,
        rest
      );
      return result.data.Data.item;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_TEACHER_DIRECTORY, organizationId] }),
  });
};
