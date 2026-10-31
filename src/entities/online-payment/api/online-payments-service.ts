import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "@/shared/api";
import { IAPIError, IAxiosResponse } from "@/shared/types";
import { APIS_ROUTES } from "@/shared/lib";

const base = (organizationId: string) => `${APIS_ROUTES.FEE_SERVICE}/${organizationId}/online-payment`;
const SETTINGS_KEY = "get-online-payment-settings";

export interface OnlinePaymentSettings {
  provider: "razorpay";
  enabled: boolean;
  keyId: string;
  hasKeySecret: boolean;
  hasWebhookSecret: boolean;
  connectedAt: string | null;
}

export interface OnlinePaymentSettingsInput {
  enabled?: boolean;
  keyId?: string;
  keySecret?: string;
  webhookSecret?: string;
}

export const useGetOnlinePaymentSettings = (organizationId: string) =>
  useQuery<OnlinePaymentSettings, IAPIError>({
    queryKey: [SETTINGS_KEY, organizationId],
    queryFn: async () => {
      const result = await apiClient.get<null, IAxiosResponse<{ item: OnlinePaymentSettings }>>(
        `${base(organizationId)}/settings`
      );
      return result.data.Data.item;
    },
    enabled: !!organizationId,
  });

export const useSaveOnlinePaymentSettings = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation<OnlinePaymentSettings, IAPIError, OnlinePaymentSettingsInput>({
    mutationFn: async (value) => {
      const result = await apiClient.put<null, IAxiosResponse<{ item: OnlinePaymentSettings }>>(
        `${base(organizationId)}/settings`,
        value
      );
      return result.data.Data.item;
    },
    onSuccess: (item) => queryClient.setQueryData([SETTINGS_KEY, organizationId], item),
  });
};
