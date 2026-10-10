import { useQuery } from "@tanstack/react-query";

import { IAPIError, IAxiosResponse, IStudentEnrollment } from "@/types";
import { APIS_ROUTES, API_QUERY_KEY } from "@/utils";
import apiClient from "@/config";

interface IStudentResponse {
  id: string;
  name: string;
  currentEnrollment: IStudentEnrollment | null;
  parentId: string | { name?: string; email?: string; phoneNumber?: string } | null;
  dateOfBirth: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

const getStudentDetails = async (
  organizationId: string,
  classId: string,
  searchTerm: string,
  limit: number,
  page: number
): Promise<{ items: IStudentResponse[]; total_count: number }> => {
  const result = await apiClient.get<null, IAxiosResponse<{ items: IStudentResponse[]; total_count: number }>>(
    `${APIS_ROUTES.STUDENT_PROFILE}/${organizationId}/get-student-profile`,
    {
      params: {
        search_term: searchTerm,
        classId: classId === "all" ? "" : classId,
        limit: limit,
        page: page,
      },
    }
  );

  return result.data.Data;
};

const useGetStudentDetails = (
  organizationId: string,
  classId: string,
  searchTerm: string,
  limit: number,
  page: number
) =>
  useQuery<{ items: IStudentResponse[]; total_count: number }, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_STUDENT_PROFILE, organizationId, classId, searchTerm, limit, page],
    queryFn: () => getStudentDetails(organizationId, classId, searchTerm, limit, page),
    enabled: !!organizationId,
  });

export default useGetStudentDetails;
