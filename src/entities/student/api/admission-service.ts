import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "@/shared/api";
import { IAPIError, IAxiosResponse } from "@/shared/types";
import { API_QUERY_KEY, APIS_ROUTES } from "@/shared/lib";

interface INextAdmissionNumber {
  prefix: string;
  admissionNumber: string;
}

const base = (organizationId: string) => `${APIS_ROUTES.STUDENT_PROFILE}/${organizationId}`;

// the number a new admission on this date would get if none is typed
export const useNextAdmissionNumber = (organizationId: string, admissionDate: string, enabled: boolean) =>
  useQuery<INextAdmissionNumber, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_NEXT_ADMISSION_NUMBER, organizationId, admissionDate.slice(0, 4)],
    queryFn: async () => {
      const result = await apiClient.get<null, IAxiosResponse<INextAdmissionNumber>>(
        `${base(organizationId)}/admissions/next-number`,
        { params: { admissionDate } }
      );
      return result.data.Data;
    },
    enabled: enabled && !!organizationId,
  });

export const useSetAdmissionPrefix = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation<{ prefix: string }, IAPIError, string>({
    mutationFn: async (prefix) => {
      const result = await apiClient.put<{ prefix: string }, IAxiosResponse<{ prefix: string }>>(
        `${base(organizationId)}/admissions/settings`,
        { prefix }
      );
      return result.data.Data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_NEXT_ADMISSION_NUMBER, organizationId] }),
  });
};

export const uploadStudentPhoto = async (organizationId: string, studentId: string, file: File) => {
  const formData = new FormData();
  formData.append("photo", file);
  await apiClient.post(`${base(organizationId)}/student/${studentId}/photo`, formData);
};

export const removeStudentPhoto = async (organizationId: string, studentId: string) => {
  await apiClient.delete(`${base(organizationId)}/student/${studentId}/photo`);
};
