import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "@/shared/api";
import { CalendarEntryType, ICalendarMonth, ICalendarRule } from "../model/types";
import { IAPIError, IAxiosResponse } from "@/shared/types";
import { APIS_ROUTES, API_MUTATION_KEY, API_QUERY_KEY } from "@/shared/lib";

const base = (organizationId: string) => `${APIS_ROUTES.CALENDAR_SERVICE}/${organizationId}`;

export const useGetCalendarMonth = (organizationId: string, year: number, month: number) =>
  useQuery<ICalendarMonth, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_CALENDAR_MONTH, organizationId, year, month],
    queryFn: async () => {
      const result = await apiClient.get<null, IAxiosResponse<ICalendarMonth>>(`${base(organizationId)}/month`, {
        params: { year, month },
      });
      return result.data.Data;
    },
    enabled: !!organizationId && year > 0 && month > 0,
    placeholderData: (previous) => previous,
  });

export interface ISaveCalendarEntryPayload {
  id?: string;
  title: string;
  type: CalendarEntryType;
  date: string;
  recurrence: { frequency: "weekly"; dayOfWeek: number } | null;
}

export const useSaveCalendarEntry = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation<ICalendarRule, IAPIError, ISaveCalendarEntryPayload>({
    mutationKey: [API_MUTATION_KEY.SAVE_CALENDAR_ENTRY],
    mutationFn: async ({ id, recurrence, ...value }) => {
      const body = id ? { ...value, recurrence } : { ...value, ...(recurrence && { recurrence }) };
      const result = id
        ? await apiClient.patch<object, IAxiosResponse<{ item: ICalendarRule }>>(`${base(organizationId)}/${id}`, body)
        : await apiClient.post<object, IAxiosResponse<{ item: ICalendarRule }>>(`${base(organizationId)}/create`, body);
      return result.data.Data.item;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_CALENDAR_MONTH, organizationId] }),
  });
};

export const useDeleteCalendarEntry = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, IAPIError, string>({
    mutationKey: [API_MUTATION_KEY.DELETE_CALENDAR_ENTRY],
    mutationFn: async (id) => {
      await apiClient.delete(`${base(organizationId)}/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_CALENDAR_MONTH, organizationId] }),
  });
};
