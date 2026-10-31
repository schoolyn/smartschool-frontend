import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "@/shared/api";
import { IAPIError, IAxiosResponse } from "@/shared/types";
import { INotice } from "../model/types";
import { APIS_ROUTES, API_QUERY_KEY, API_MUTATION_KEY } from "@/shared/lib";

export const useGetMyNotices = (organizationId: string) =>
  useQuery<{ items: INotice[] }, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_MY_NOTICES, organizationId],
    queryFn: async () => {
      const result = await apiClient.get<null, IAxiosResponse<{ items: INotice[] }>>(
        `${APIS_ROUTES.SCHOOL_SERVICE}/notice/${organizationId}/my-notices`
      );
      return result.data.Data;
    },
    enabled: !!organizationId,
  });

export const useMarkNoticeRead = (organizationId: string) => {
  const queryClient = useQueryClient();
  const queryKey = [API_QUERY_KEY.GET_MY_NOTICES, organizationId];
  return useMutation<void, IAPIError, string>({
    mutationKey: [API_MUTATION_KEY.MARK_NOTICE_READ],
    mutationFn: async (noticeId: string) => {
      await apiClient.post(`${APIS_ROUTES.SCHOOL_SERVICE}/notice/${organizationId}/notice/${noticeId}/read`);
    },
    // only one notice's read state changed, so flip it in cache instead of refetching every notice
    onSuccess: (_data, noticeId) => {
      queryClient.setQueryData<{ items: INotice[] }>(queryKey, (current) =>
        current
          ? {
              ...current,
              items: current.items.map((notice) => (notice.id === noticeId ? { ...notice, isRead: true } : notice)),
            }
          : current
      );
    },
  });
};
