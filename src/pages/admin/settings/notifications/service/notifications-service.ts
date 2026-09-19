import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "@/config";
import { IAPIError, IAxiosResponse, IEmailLog } from "@/types";
import { APIS_ROUTES, API_QUERY_KEY, API_MUTATION_KEY } from "@/utils";

const base = (organizationId: string) => `${APIS_ROUTES.ORGANIZATION_SERVICE}/${organizationId}`;

interface IEmailNotificationLogResponse {
  items: IEmailLog[];
  total_count: number;
  settings: { emailNotificationsEnabled: boolean };
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
  return useMutation<void, IAPIError, boolean>({
    mutationKey: [API_MUTATION_KEY.UPDATE_EMAIL_NOTIFICATION_SETTINGS],
    mutationFn: async (emailNotificationsEnabled) => {
      await apiClient.patch(`${base(organizationId)}/email-notifications/settings`, { emailNotificationsEnabled });
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_EMAIL_NOTIFICATION_LOG, organizationId] }),
  });
};
