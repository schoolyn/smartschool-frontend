import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "@/shared/api";
import { IAPIError, IAxiosResponse } from "@/shared/types";
import { IPTMEvent, IPTMSlot, IPTMBooking } from "../model/types";
import { APIS_ROUTES, API_QUERY_KEY, API_MUTATION_KEY } from "@/shared/lib";

const base = (organizationId: string) => `${APIS_ROUTES.PTM_SERVICE}/${organizationId}`;

export const useGetPTMEvents = (organizationId: string) =>
  useQuery<{ items: IPTMEvent[] }, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_PTM_EVENTS, organizationId],
    queryFn: async () => {
      const result = await apiClient.get<null, IAxiosResponse<{ items: IPTMEvent[] }>>(`${base(organizationId)}/event`);
      return result.data.Data;
    },
    enabled: !!organizationId,
  });

interface ICreatePTMEventPayload {
  academicYearId: string;
  title: string;
  date: string;
  mode: "onsite" | "online";
  venue?: string;
  defaultMeetingLink?: string;
  sectionIds: string[];
  slotDurationMins: number;
}

export const useCreatePTMEvent = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, IAPIError, ICreatePTMEventPayload>({
    mutationKey: [API_MUTATION_KEY.CREATE_PTM_EVENT],
    mutationFn: async (value) => {
      await apiClient.post(`${base(organizationId)}/event`, value);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_PTM_EVENTS, organizationId] }),
  });
};

interface IGenerateSlotsPayload {
  ptmEventId: string;
  teacherUserId: string;
  sectionId: string;
  startAt: string;
  endAt: string;
}

export const useGenerateSlots = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, IAPIError, IGenerateSlotsPayload>({
    mutationKey: [API_MUTATION_KEY.GENERATE_PTM_SLOTS],
    // local wall-clock picker times are sent as exact instants, since the server runs in UTC
    mutationFn: async (value) => {
      await apiClient.post(`${base(organizationId)}/event/${value.ptmEventId}/slot/generate`, {
        ...value,
        startAt: new Date(value.startAt).toISOString(),
        endAt: new Date(value.endAt).toISOString(),
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_PTM_SLOTS, organizationId, variables.ptmEventId] });
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_MY_PTM_AGENDA, organizationId] });
    },
  });
};

export const useGetSlotsForEvent = (organizationId: string, ptmEventId?: string) =>
  useQuery<{ items: IPTMSlot[] }, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_PTM_SLOTS, organizationId, ptmEventId],
    queryFn: async () => {
      const result = await apiClient.get<null, IAxiosResponse<{ items: IPTMSlot[] }>>(
        `${base(organizationId)}/event/${ptmEventId}/slot`
      );
      return result.data.Data;
    },
    enabled: !!organizationId && !!ptmEventId,
  });

export const useBookPTMSlot = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, IAPIError, { slotId: string; studentId: string; parentNote?: string; ptmEventId: string }>({
    mutationKey: [API_MUTATION_KEY.BOOK_PTM_SLOT],
    mutationFn: async (value) => {
      await apiClient.post(`${base(organizationId)}/slot/${value.slotId}/book`, {
        studentId: value.studentId,
        parentNote: value.parentNote,
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_PTM_SLOTS, organizationId, variables.ptmEventId] });
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_MY_PTM_BOOKINGS, organizationId] });
    },
  });
};

export const useCancelPTMBooking = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, IAPIError, string>({
    mutationKey: [API_MUTATION_KEY.CANCEL_PTM_BOOKING],
    mutationFn: async (bookingId) => {
      await apiClient.post(`${base(organizationId)}/booking/${bookingId}/cancel`);
    },
    // the freed seat shows again in the slot lists
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_MY_PTM_BOOKINGS, organizationId] });
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_PTM_SLOTS, organizationId] });
    },
  });
};

export const useGetMyPTMBookings = (organizationId: string) =>
  useQuery<{ items: IPTMBooking[] }, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_MY_PTM_BOOKINGS, organizationId],
    queryFn: async () => {
      const result = await apiClient.get<null, IAxiosResponse<{ items: IPTMBooking[] }>>(
        `${base(organizationId)}/my-bookings`
      );
      return result.data.Data;
    },
    enabled: !!organizationId,
  });

export const useGetMyPTMAgenda = (organizationId: string) =>
  useQuery<{ items: { slot: IPTMSlot; booking: IPTMBooking | null }[] }, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_MY_PTM_AGENDA, organizationId],
    queryFn: async () => {
      const result = await apiClient.get<
        null,
        IAxiosResponse<{ items: { slot: IPTMSlot; booking: IPTMBooking | null }[] }>
      >(`${base(organizationId)}/my-agenda`);
      return result.data.Data;
    },
    enabled: !!organizationId,
  });
