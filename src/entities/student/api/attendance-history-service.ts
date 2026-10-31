import { useQuery } from "@tanstack/react-query";

import apiClient from "@/shared/api";
import { IAPIError, IAxiosResponse } from "@/shared/types";
import { IAttendanceRecord } from "@/entities/attendance";
import { APIS_ROUTES } from "@/shared/lib";

interface IAttendanceHistoryResponse {
  items: IAttendanceRecord[];
  summary: { present: number; absent: number; late: number; excused: number; total: number };
}

export const useGetStudentAttendanceHistory = (organizationId: string, studentId: string, from?: string, to?: string) =>
  useQuery<IAttendanceHistoryResponse, IAPIError>({
    queryKey: ["get-student-attendance-history", organizationId, studentId, from, to],
    queryFn: async () => {
      const result = await apiClient.get<null, IAxiosResponse<IAttendanceHistoryResponse>>(
        `${APIS_ROUTES.ATTENDANCE_SERVICE}/${organizationId}/student/${studentId}`,
        { params: { from, to } }
      );
      return result.data.Data;
    },
    enabled: !!organizationId && !!studentId,
  });
