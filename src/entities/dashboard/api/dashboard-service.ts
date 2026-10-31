import { useQuery } from "@tanstack/react-query";

import apiClient from "@/shared/api";
import { IAPIError, IAxiosResponse } from "@/shared/types";
import { APIS_ROUTES, API_QUERY_KEY } from "@/shared/lib";

export interface IDashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  activeNotices: number;
  pendingPayments: number | null;
  attendanceToday: number | null;
  homeworksToday: number | null;
}

const getDashboardStats = async (organizationId: string): Promise<IDashboardStats> => {
  const result = await apiClient.get<null, IAxiosResponse<{ item: IDashboardStats }>>(
    `${APIS_ROUTES.DASHBOARD_SERVICE}/${organizationId}/stats`
  );
  return result.data.Data.item;
};

export const useGetDashboardStats = (organizationId: string) =>
  useQuery<IDashboardStats, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_DASHBOARD_STATS, organizationId],
    queryFn: () => getDashboardStats(organizationId),
    enabled: !!organizationId,
  });

export interface IDashboardCharts {
  examTrend: { name: string; percentage: number }[];
  monthlyAttendance: { month: string; percentage: number }[];
}

const getDashboardCharts = async (organizationId: string): Promise<IDashboardCharts> => {
  const result = await apiClient.get<null, IAxiosResponse<{ item: IDashboardCharts }>>(
    `${APIS_ROUTES.DASHBOARD_SERVICE}/${organizationId}/charts`
  );
  return result.data.Data.item;
};

export const useGetDashboardCharts = (organizationId: string) =>
  useQuery<IDashboardCharts, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_DASHBOARD_CHARTS, organizationId],
    queryFn: () => getDashboardCharts(organizationId),
    enabled: !!organizationId,
  });

interface ITeacherAssignmentEntry {
  id: string;
  classId: { id: string; name: string };
  sectionId: { id: string; name: string };
  subjectId: { id: string; name: string; code: string } | null;
  assignmentRole: "SUBJECT_TEACHER" | "CLASS_TEACHER";
}

interface ITimetableSlotEntry {
  id: string;
  subjectId: { id: string; name: string; code: string };
  classId: { id: string; name: string };
  sectionId: { id: string; name: string };
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string;
}

interface INoticeEntry {
  id: string;
  title: string;
  type: string;
  createdAt: string;
}

export interface IMyTeachingLoad {
  assignments: ITeacherAssignmentEntry[];
  todaySlots: ITimetableSlotEntry[];
  recentNotices: INoticeEntry[];
}

export const useGetMyTeachingLoad = (organizationId: string) =>
  useQuery<IMyTeachingLoad, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_MY_TEACHING_LOAD, organizationId],
    queryFn: async () => {
      const result = await apiClient.get<null, IAxiosResponse<{ item: IMyTeachingLoad }>>(
        `${APIS_ROUTES.STAFF_SERVICE}/${organizationId}/my-teaching-load`
      );
      return result.data.Data.item;
    },
    enabled: !!organizationId,
  });

export interface IParentDashboardStats {
  childrenCount: number;
  upcomingHomeworkCount: number;
  pendingFeesTotal: number;
  recentNoticesCount: number;
}

const getParentDashboard = async (organizationId: string): Promise<IParentDashboardStats> => {
  const result = await apiClient.get<null, IAxiosResponse<{ item: IParentDashboardStats }>>(
    `${APIS_ROUTES.DASHBOARD_SERVICE}/${organizationId}/parent-stats`
  );
  return result.data.Data.item;
};

export const useGetParentDashboard = (organizationId: string) =>
  useQuery<IParentDashboardStats, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_PARENT_DASHBOARD, organizationId],
    queryFn: () => getParentDashboard(organizationId),
    enabled: !!organizationId,
  });
