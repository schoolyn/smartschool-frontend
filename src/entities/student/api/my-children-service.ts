import { useQuery } from "@tanstack/react-query";

import apiClient from "@/shared/api";
import { IAPIError, IAxiosResponse } from "@/shared/types";
import { APIS_ROUTES } from "@/shared/lib";

export interface IMyChildLink {
  id: string;
  isPrimaryGuardian: boolean;
  studentId: {
    id: string;
    name: string;
    admissionNumber: string;
    currentEnrollment?: {
      classId?: { id: string; name: string };
      sectionId?: { id: string; name: string };
    };
  };
}

export const useGetMyChildren = (organizationId: string) =>
  useQuery<{ items: IMyChildLink[] }, IAPIError>({
    queryKey: ["get-my-children", organizationId],
    queryFn: async () => {
      const result = await apiClient.get<null, IAxiosResponse<{ items: IMyChildLink[] }>>(
        `${APIS_ROUTES.STUDENT_PROFILE}/${organizationId}/my-children`
      );
      return result.data.Data;
    },
    enabled: !!organizationId,
  });
