import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "@/shared/api/api-client";
import { IAPIError, IAxiosResponse } from "@/shared/types";
import { INotification } from "../model/types";
import { APIS_ROUTES, API_QUERY_KEY, API_MUTATION_KEY } from "@/shared/lib";

type MyNotificationsResponse = { items: INotification[]; unread_count: number };

export const useGetMyNotifications = (organizationId?: string) =>
  useQuery<MyNotificationsResponse, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_MY_NOTIFICATIONS, organizationId],
    queryFn: async () => {
      const result = await apiClient.get<null, IAxiosResponse<MyNotificationsResponse>>(
        `${APIS_ROUTES.SCHOOL_SERVICE}/notice/${organizationId}/my-notifications`
      );
      return result.data.Data;
    },
    enabled: !!organizationId,
  });

export const useMarkNotificationRead = (organizationId?: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, IAPIError, string>({
    mutationKey: [API_MUTATION_KEY.MARK_NOTIFICATION_READ],
    mutationFn: async (notificationId: string) => {
      await apiClient.post(
        `${APIS_ROUTES.SCHOOL_SERVICE}/notice/${organizationId}/notification/${notificationId}/read`
      );
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_MY_NOTIFICATIONS, organizationId] }),
  });
};

export const useMarkAllNotificationsRead = (organizationId?: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, IAPIError, void>({
    mutationKey: [API_MUTATION_KEY.MARK_ALL_NOTIFICATIONS_READ],
    mutationFn: async () => {
      await apiClient.post(`${APIS_ROUTES.SCHOOL_SERVICE}/notice/${organizationId}/notifications/read-all`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_MY_NOTIFICATIONS, organizationId] }),
  });
};
