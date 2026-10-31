import { useQuery } from "@tanstack/react-query";

import apiClient from "@/shared/api";
import { IAPIError, IAxiosResponse } from "@/shared/types";
import { IHomework } from "../model/types";
import { APIS_ROUTES, API_QUERY_KEY } from "@/shared/lib";

export const useGetHomeworkForStudent = (organizationId: string, studentId: string) =>
  useQuery<{ items: IHomework[] }, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_HOMEWORK_LIST, "for-student", organizationId, studentId],
    queryFn: async () => {
      const result = await apiClient.get<null, IAxiosResponse<{ items: IHomework[] }>>(
        `${APIS_ROUTES.HOMEWORK_SERVICE}/${organizationId}/student/${studentId}`
      );
      return result.data.Data;
    },
    enabled: !!organizationId && !!studentId,
  });
