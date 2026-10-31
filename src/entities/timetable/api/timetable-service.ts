import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "@/shared/api";
import { IAPIError, IAxiosResponse } from "@/shared/types";
import { ITimetableSlot } from "../model/types";
import { APIS_ROUTES, API_MUTATION_KEY, API_QUERY_KEY } from "@/shared/lib";

const base = (organizationId: string) => `${APIS_ROUTES.STAFF_SERVICE}/${organizationId}/timetable-slot`;

// a section's week for admins; with no section, a teacher's own week
export const useGetTimetable = (organizationId: string, sectionId: string, enabled = true) =>
  useQuery<{ items: ITimetableSlot[] }, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_TIMETABLE, organizationId, sectionId],
    queryFn: async () => {
      const result = await apiClient.get<null, IAxiosResponse<{ items: ITimetableSlot[] }>>(base(organizationId), {
        params: sectionId ? { sectionId } : undefined,
      });
      return result.data.Data;
    },
    enabled: !!organizationId && enabled,
  });

export interface ICreateSlotPayload {
  academicYearId: string;
  classId: string;
  sectionId: string;
  subjectId: string;
  teacherUserId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string;
}

export const useCreateTimetableSlot = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, IAPIError, ICreateSlotPayload>({
    mutationKey: [API_MUTATION_KEY.CREATE_TIMETABLE_SLOT],
    mutationFn: async (value) => {
      await apiClient.post(base(organizationId), value);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_TIMETABLE, organizationId] }),
  });
};

export const useDeleteTimetableSlot = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, IAPIError, string>({
    mutationKey: [API_MUTATION_KEY.DELETE_TIMETABLE_SLOT],
    mutationFn: async (slotId) => {
      await apiClient.delete(`${base(organizationId)}/${slotId}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_TIMETABLE, organizationId] }),
  });
};
