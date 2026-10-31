import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import apiClient from "@/shared/api";
import { IAPIError, IAxiosResponse, Paged } from "@/shared/types";
import { IStudentFormData, IStudentAdmissionDetails, IStudentEnrollment, IGuardian } from "../model/types";
import { API_MUTATION_KEY, API_QUERY_KEY, APIS_ROUTES, saveFile } from "@/shared/lib";

interface IAddStudentResponse {
  item: { id: string; admissionNumber: string };
  invited: boolean;
  message: string;
}

const addStudent = async (organizationId: string, data: IStudentFormData) => {
  const response = await apiClient.post<IStudentFormData, IAxiosResponse<IAddStudentResponse>>(
    `${APIS_ROUTES.STUDENT_PROFILE}/${organizationId}/add-student-profile`,
    data
  );

  return response.data.Data;
};

export const useAddStudent = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation<IAddStudentResponse, IAPIError, IStudentFormData>({
    mutationKey: [API_MUTATION_KEY.ADD_STUDENT_PROFILE],
    mutationFn: (data: IStudentFormData) => addStudent(organizationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_STUDENT_PROFILE, organizationId] });
    },
  });
};

export interface IBulkImportResult {
  createdCount: number;
  failed: { row: number; name: string; reason: string }[];
}

interface IBulkImportValue {
  academicYearId: string;
  classId: string;
  sectionId: string;
  file: File;
}

const bulkImportStudents = async (organizationId: string, value: IBulkImportValue) => {
  const formData = new FormData();
  formData.append("academicYearId", value.academicYearId);
  formData.append("classId", value.classId);
  formData.append("sectionId", value.sectionId);
  formData.append("file", value.file);

  const result = await apiClient.post<null, IAxiosResponse<{ item: IBulkImportResult }>>(
    `${APIS_ROUTES.STUDENT_PROFILE}/${organizationId}/bulk-import-students`,
    formData
  );

  return result.data.Data.item;
};

export const useBulkImportStudents = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation<IBulkImportResult, IAPIError, IBulkImportValue>({
    mutationFn: (value) => bulkImportStudents(organizationId, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_STUDENT_PROFILE, organizationId] });
    },
  });
};

const deleteStudent = async (organizationId: string, userId: string) => {
  await apiClient.delete(`${APIS_ROUTES.STUDENT_PROFILE}/${organizationId}/delete-student/${userId}`);
};

export const useDeleteStudent = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, IAPIError, string>({
    mutationKey: [API_MUTATION_KEY.DELETE_USER],
    mutationFn: (userId) => deleteStudent(organizationId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_STUDENT_PROFILE, organizationId] });
    },
  });
};

// the filtered student list as a CSV built and capped by the server, in the upload template's columns
export const downloadStudentsCsv = async (
  organizationId: string,
  classId: string,
  searchTerm: string,
  limit: number
) => {
  const result = await apiClient.get(`${APIS_ROUTES.STUDENT_PROFILE}/${organizationId}/export-student-profile`, {
    params: {
      search_term: searchTerm || undefined,
      classId: classId === "all" ? undefined : classId || undefined,
      limit,
    },
    responseType: "blob",
  });
  saveFile(result.data, "students.csv");
};

interface IParentResponse {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
}

const getParentByEmail = async (
  organizationId: string,
  email: string
): Promise<{ item: IParentResponse; is_parent_exists: boolean }> => {
  const result = await apiClient.get<null, IAxiosResponse<{ item: IParentResponse; is_parent_exists: boolean }>>(
    `${APIS_ROUTES.STUDENT_PROFILE}/${organizationId}/get-parent-profile/${email}`
  );

  return result.data.Data;
};

export const useGetParentByEmail = (organizationId: string, email: string) =>
  useQuery<{ item: IParentResponse; is_parent_exists: boolean }, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_PARENT_DETAILS, organizationId, email],
    queryFn: () => getParentByEmail(organizationId, email),
    enabled: !!organizationId && !!email,
  });

export interface IStudentDetailResponse extends IStudentAdmissionDetails {
  id: string;
  name: string;
  admissionNumber: string;
  admissionDate: string;
  currentEnrollment: IStudentEnrollment | null;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  pincode?: string;
  parentName: string;
  parentEmail: string;
  phoneNumber: string;
  parentId: string;
  guardians: IGuardian[];
  // a short-lived signed link, or null
  photoUrl: string | null;
  status: "active" | "inactive" | "suspended";
}

const getStudentById = async (organizationId: string, studentId: string): Promise<{ item: IStudentDetailResponse }> => {
  const result = await apiClient.get<null, IAxiosResponse<{ item: IStudentDetailResponse }>>(
    `${APIS_ROUTES.STUDENT_PROFILE}/${organizationId}/get-student-by-id/${studentId}`
  );

  return result.data.Data;
};

export const useGetStudentById = (organizationId: string, studentId: string) =>
  useQuery<{ item: IStudentDetailResponse }, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_STUDENT_BY_ID, studentId],
    queryFn: () => getStudentById(organizationId, studentId),
    enabled: !!studentId,
  });

interface IStudentResponse {
  id: string;
  name: string;
  currentEnrollment: IStudentEnrollment | null;
  parentId: string | { id?: string; name?: string; email?: string; phoneNumber?: string; status?: string } | null;
  dateOfBirth: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  admissionNumber?: string;
  photoUrl?: string | null;
}

const getStudentDetails = async (
  organizationId: string,
  classId: string,
  searchTerm: string,
  limit: number,
  page: number
): Promise<Paged<IStudentResponse>> => {
  const result = await apiClient.get<null, IAxiosResponse<Paged<IStudentResponse>>>(
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

export const useGetStudentDetails = (
  organizationId: string,
  classId: string,
  searchTerm: string,
  limit: number,
  page: number
) =>
  useQuery<Paged<IStudentResponse>, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_STUDENT_PROFILE, organizationId, classId, searchTerm, limit, page],
    queryFn: () => getStudentDetails(organizationId, classId, searchTerm, limit, page),
    enabled: !!organizationId,
  });

// emails a parent who has not set a password yet a fresh set-password link
const reinviteParent = async (userId: string) => {
  await apiClient.post(`${APIS_ROUTES.REINVITE_USER}/${userId}`);
};

export const useReinviteParent = () =>
  useMutation<void, IAPIError, string>({
    mutationKey: [API_MUTATION_KEY.REINVITE_USER],
    mutationFn: reinviteParent,
  });

const updateStudent = async (organizationId: string, studentDetails: IStudentFormData) => {
  await apiClient.put(
    `${APIS_ROUTES.STUDENT_PROFILE}/${organizationId}/edit-student-profile/${studentDetails.id}`,
    studentDetails
  );
};

export const useUpdateStudentDetail = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, IAPIError, IStudentFormData>({
    mutationKey: [API_MUTATION_KEY.UPDATE_STUDENT_DETAILS],
    mutationFn: (values) => updateStudent(organizationId, values),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_STUDENT_PROFILE, organizationId] });
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_STUDENT_BY_ID, variables.id] });
    },
  });
};
