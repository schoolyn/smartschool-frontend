import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "@/shared/api";
import { IAPIError, IAxiosResponse, Paged } from "@/shared/types";
import { IEmailLog } from "../model/types";
import { APIS_ROUTES, API_QUERY_KEY, API_MUTATION_KEY } from "@/shared/lib";

const base = (organizationId: string) => `${APIS_ROUTES.ORGANIZATION_SERVICE}/${organizationId}`;

export interface NotificationSettings {
  emailNotificationsEnabled: boolean;
  feeRemindersEnabled: boolean;
}

interface IEmailNotificationLogResponse extends Paged<IEmailLog> {
  settings: NotificationSettings;
}

export const useGetEmailNotificationLog = (organizationId: string) =>
  useQuery<IEmailNotificationLogResponse, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_EMAIL_NOTIFICATION_LOG, organizationId],
    queryFn: async () => {
      const result = await apiClient.get<null, IAxiosResponse<IEmailNotificationLogResponse>>(
        `${base(organizationId)}/email-notifications`
      );
      return result.data.Data;
    },
    enabled: !!organizationId,
  });

export const useUpdateEmailNotificationSettings = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, IAPIError, Partial<NotificationSettings>>({
    mutationKey: [API_MUTATION_KEY.UPDATE_EMAIL_NOTIFICATION_SETTINGS],
    mutationFn: async (changes) => {
      await apiClient.patch(`${base(organizationId)}/email-notifications/settings`, changes);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_EMAIL_NOTIFICATION_LOG, organizationId] }),
  });
};
