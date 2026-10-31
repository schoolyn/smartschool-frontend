import { useMutation, useQueryClient } from "@tanstack/react-query";

import apiClient from "@/shared/api";
import { IAPIError, IAxiosResponse } from "@/shared/types";
import { ILetterhead } from "../model/types";
import { API_MUTATION_KEY, API_QUERY_KEY, APIS_ROUTES } from "@/shared/lib";

// the school's letterhead lines; certificates issued after this print them
export const useUpdateLetterhead = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation<ILetterhead, IAPIError, ILetterhead>({
    mutationKey: [API_MUTATION_KEY.UPDATE_LETTERHEAD],
    mutationFn: async (letterhead) => {
      const result = await apiClient.put<null, IAxiosResponse<{ letterhead: ILetterhead }>>(
        `${APIS_ROUTES.ORGANIZATION_SERVICE}/${organizationId}/letterhead`,
        letterhead
      );
      return result.data.Data.letterhead;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_ALL_ORGANIZATIONS] });
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_CERTIFICATE_DRAFT] });
    },
  });
};
