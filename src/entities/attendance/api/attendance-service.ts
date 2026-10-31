import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import apiClient from "@/shared/api";
import { IAPIError, IAxiosResponse } from "@/shared/types";
import { IAttendanceRecord, IAttendanceSession, AttendanceStatus } from "../model/types";
import { APIS_ROUTES, API_QUERY_KEY } from "@/shared/lib";

const base = (organizationId: string) => `${APIS_ROUTES.ATTENDANCE_SERVICE}/${organizationId}`;

export interface ISectionRosterStudent {
  id: string;
  name: string;
  currentEnrollment: { rollNumber: string } | null;
}

// active students from the attendance roster: open to section teachers, and excludes students who left
export const useGetSectionRoster = (organizationId: string, sectionId: string) =>
  useQuery<{ items: ISectionRosterStudent[] }, IAPIError>({
    queryKey: ["get-section-roster", organizationId, sectionId],
    queryFn: async () => {
      const result = await apiClient.get<
        null,
        IAxiosResponse<{ items: { id: string; name: string; rollNumber: string }[] }>
      >(`${base(organizationId)}/section-roster`, { params: { sectionId } });
      return {
        items: result.data.Data.items.map(({ rollNumber, ...student }) => ({
          ...student,
          currentEnrollment: { rollNumber },
        })),
      };
    },
    enabled: !!organizationId && !!sectionId,
  });

export const useGetSectionAttendance = (organizationId: string, sectionId: string, date: string) =>
  useQuery<{ item: { session: IAttendanceSession; records: IAttendanceRecord[] } | null }, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_SECTION_ATTENDANCE, organizationId, sectionId, date],
    queryFn: async () => {
      const result = await apiClient.get<
        null,
        IAxiosResponse<{ item: { session: IAttendanceSession; records: IAttendanceRecord[] } | null }>
      >(`${base(organizationId)}/section`, { params: { sectionId, date } });
      return result.data.Data;
    },
    enabled: !!organizationId && !!sectionId && !!date,
  });

export interface ISectionAttendanceReportRow {
  studentId: string;
  studentName: string;
  rollNumber: string;
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
}

export const useGetSectionAttendanceReport = (organizationId: string, sectionId: string, from: string, to: string) =>
  useQuery<{ items: ISectionAttendanceReportRow[]; totalSessions: number }, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_SECTION_ATTENDANCE_REPORT, organizationId, sectionId, from, to],
    queryFn: async () => {
      const result = await apiClient.get<
        null,
        IAxiosResponse<{ items: ISectionAttendanceReportRow[]; totalSessions: number }>
      >(`${base(organizationId)}/section-report`, { params: { sectionId, from, to } });
      return result.data.Data;
    },
    enabled: !!organizationId && !!sectionId && !!from && !!to,
  });

export interface IMonthRegisterRow {
  studentId: string;
  studentName: string;
  rollNumber: string;
  cells: Record<string, AttendanceStatus>;
  summary: {
    present: number;
    late: number;
    absent: number;
    excused: number;
    holiday: number;
    missing: number;
    percent: number;
  };
}

export interface IMonthRegister {
  days: { date: string; weekday: number; isHoliday: boolean }[];
  schoolDays: number;
  items: IMonthRegisterRow[];
}

// a "YYYY-MM" month as a student-by-day grid, with holidays from the school calendar
export const useGetMonthRegister = (organizationId: string, sectionId: string, month: string) =>
  useQuery<IMonthRegister, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_SECTION_ATTENDANCE_REPORT, organizationId, sectionId, "month", month],
    queryFn: async () => {
      const result = await apiClient.get<null, IAxiosResponse<IMonthRegister>>(
        `${base(organizationId)}/section-month`,
        {
          params: { sectionId, year: Number(month.slice(0, 4)), month: Number(month.slice(5, 7)) },
        }
      );
      return result.data.Data;
    },
    enabled: !!organizationId && !!sectionId && /^\d{4}-\d{2}$/.test(month),
    placeholderData: (previous) => previous,
  });

interface IMarkAttendanceValue {
  sectionId: string;
  date: string;
  records: { studentId: string; status: AttendanceStatus; reason?: string }[];
}

export const useMarkAttendance = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, IAPIError, IMarkAttendanceValue>({
    mutationFn: async (value) => {
      await apiClient.post(`${base(organizationId)}/mark`, value);
    },
    // the day, the section's report and each student's history all change
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_SECTION_ATTENDANCE, organizationId] });
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_SECTION_ATTENDANCE_REPORT, organizationId] });
      queryClient.invalidateQueries({ queryKey: ["get-student-attendance-history"] });
    },
  });
};
