import { useQuery } from "@tanstack/react-query";

import apiClient from "@/shared/api";
import { IAPIError, IAxiosResponse } from "@/shared/types";
import { IBillingSummary } from "@/entities/organization";
import { API_QUERY_KEY } from "@/shared/lib";

export const useGetMyBillingSummary = (organizationId: string) =>
  useQuery<IBillingSummary, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_MY_BILLING_SUMMARY, organizationId],
    queryFn: async () => {
      const result = await apiClient.get<null, IAxiosResponse<{ item: IBillingSummary }>>(
        `/billing-service/v1/${organizationId}/my-summary`
      );
      return result.data.Data.item;
    },
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000,
  });
