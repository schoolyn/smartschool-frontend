import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import apiClient from "@/config";
import { IAPIError, IAxiosResponse, IAcademicYear, IClass, ISection, ISubject, ITeacherAssignment } from "@/types";
import { APIS_ROUTES, API_QUERY_KEY, API_MUTATION_KEY } from "@/utils";

type RecordStatus = "active" | "inactive";

const base = (organizationId: string) => `${APIS_ROUTES.ACADEMIC_SERVICE}/${organizationId}`;

const getItems = async <T>(url: string, params?: object) => {
  const result = await apiClient.get<null, IAxiosResponse<{ items: T[] }>>(url, { params });
  return result.data.Data;
};

// A mutation that, once it succeeds, refreshes the lists it can have changed. Changing a class also changes the counts
// shown for its sections (and the other way round), so related lists are refreshed together.
const useRefreshingMutation = <TVariables, TResult = void>(
  organizationId: string,
  mutationKey: string,
  mutationFn: (variables: TVariables) => Promise<TResult>,
  refresh: string[],
) => {
  const queryClient = useQueryClient();
  return useMutation<TResult, IAPIError, TVariables>({
    mutationKey: [mutationKey],
    mutationFn,
    onSuccess: () =>
      Promise.all(refresh.map((key) => queryClient.invalidateQueries({ queryKey: [key, organizationId] }))),
  });
};

// ── academic years ──

export const useGetAcademicYears = (organizationId: string) =>
  useQuery<{ items: IAcademicYear[] }, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_ACADEMIC_YEARS, organizationId],
    queryFn: () => getItems<IAcademicYear>(`${base(organizationId)}/academic-year`),
    enabled: !!organizationId,
  });

export const useCreateAcademicYear = (organizationId: string) =>
  useRefreshingMutation<Partial<IAcademicYear>>(
    organizationId,
    API_MUTATION_KEY.CREATE_ACADEMIC_YEAR,
    (value) => apiClient.post(`${base(organizationId)}/academic-year`, value),
    [API_QUERY_KEY.GET_ACADEMIC_YEARS],
  );

export const useUpdateAcademicYear = (organizationId: string) =>
  useRefreshingMutation<{ id: string } & Partial<IAcademicYear>>(
    organizationId,
    API_MUTATION_KEY.UPDATE_ACADEMIC_YEAR,
    ({ id, ...value }) => apiClient.put(`${base(organizationId)}/academic-year/${id}`, value),
    [API_QUERY_KEY.GET_ACADEMIC_YEARS],
  );

export interface IRolloverPreview {
  sourceYear: { id: string; name: string };
  classes: { name: string; sections: string[] }[];
  subjects: { name: string; code: string }[];
  counts: { classes: number; sections: number; subjects: number };
}

export interface IRolloverRequest {
  sourceYearId: string;
  name: string;
  startDate: string;
  endDate: string;
  copyClasses: boolean;
  copySubjects: boolean;
  isCurrent: boolean;
}

export interface IRolloverResult {
  item: IAcademicYear;
  copied: { classes: number; sections: number; subjects: number };
}

// what starting a new year from this one would copy, shown before anything is created
export const useGetRolloverPreview = (organizationId: string, academicYearId?: string) =>
  useQuery<IRolloverPreview, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_ROLLOVER_PREVIEW, organizationId, academicYearId],
    queryFn: async () => {
      const result = await apiClient.get<null, IAxiosResponse<IRolloverPreview>>(
        `${base(organizationId)}/academic-year/${academicYearId}/rollover-preview`,
      );
      return result.data.Data;
    },
    enabled: !!organizationId && !!academicYearId,
  });

export const useRolloverAcademicYear = (organizationId: string) =>
  useRefreshingMutation<IRolloverRequest, IRolloverResult>(
    organizationId,
    API_MUTATION_KEY.ROLLOVER_ACADEMIC_YEAR,
    async ({ sourceYearId, ...body }) => {
      const result = await apiClient.post<null, IAxiosResponse<IRolloverResult>>(
        `${base(organizationId)}/academic-year/${sourceYearId}/rollover`,
        body,
      );
      return result.data.Data;
    },
    [
      API_QUERY_KEY.GET_ACADEMIC_YEARS,
      API_QUERY_KEY.GET_CLASSES,
      API_QUERY_KEY.GET_SECTIONS,
      API_QUERY_KEY.GET_SUBJECTS,
    ],
  );

// ── classes ──

export const useGetClasses = (organizationId: string, academicYearId?: string, status?: RecordStatus) =>
  useQuery<{ items: IClass[] }, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_CLASSES, organizationId, academicYearId, status],
    queryFn: () => getItems<IClass>(`${base(organizationId)}/class`, { academicYearId, status }),
    enabled: !!organizationId && !!academicYearId,
  });

const CLASS_LISTS = [API_QUERY_KEY.GET_CLASSES, API_QUERY_KEY.GET_SECTIONS];

export const useCreateClass = (organizationId: string) =>
  useRefreshingMutation<Partial<IClass>>(
    organizationId,
    API_MUTATION_KEY.CREATE_CLASS,
    (value) => apiClient.post(`${base(organizationId)}/class`, value),
    CLASS_LISTS,
  );

export const useUpdateClass = (organizationId: string) =>
  useRefreshingMutation<{ id: string } & Partial<IClass>>(
    organizationId,
    API_MUTATION_KEY.UPDATE_CLASS,
    ({ id, ...value }) => apiClient.put(`${base(organizationId)}/class/${id}`, value),
    CLASS_LISTS,
  );

export const useDeactivateClass = (organizationId: string) =>
  useRefreshingMutation<string>(
    organizationId,
    API_MUTATION_KEY.DEACTIVATE_CLASS,
    (id) => apiClient.delete(`${base(organizationId)}/class/${id}`),
    CLASS_LISTS,
  );

// ── sections ──

export const useGetSections = (organizationId: string, classId?: string, status?: RecordStatus) =>
  useQuery<{ items: ISection[] }, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_SECTIONS, organizationId, classId, status],
    queryFn: () => getItems<ISection>(`${base(organizationId)}/section`, { classId, status }),
    enabled: !!organizationId && !!classId,
  });

type SectionInput = Omit<Partial<ISection>, "classTeacherId"> & { classTeacherId?: string };

export const useCreateSection = (organizationId: string) =>
  useRefreshingMutation<SectionInput>(
    organizationId,
    API_MUTATION_KEY.CREATE_SECTION,
    (value) => apiClient.post(`${base(organizationId)}/section`, value),
    CLASS_LISTS,
  );

export const useUpdateSection = (organizationId: string) =>
  useRefreshingMutation<{ id: string } & SectionInput>(
    organizationId,
    API_MUTATION_KEY.UPDATE_SECTION,
    ({ id, ...value }) => apiClient.put(`${base(organizationId)}/section/${id}`, value),
    CLASS_LISTS,
  );

export const useDeactivateSection = (organizationId: string) =>
  useRefreshingMutation<string>(
    organizationId,
    API_MUTATION_KEY.DEACTIVATE_SECTION,
    (id) => apiClient.delete(`${base(organizationId)}/section/${id}`),
    CLASS_LISTS,
  );

// ── subjects ──

export const useGetSubjects = (organizationId: string, academicYearId?: string, status?: RecordStatus) =>
  useQuery<{ items: ISubject[] }, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_SUBJECTS, organizationId, academicYearId, status],
    queryFn: () => getItems<ISubject>(`${base(organizationId)}/subject`, { academicYearId, status }),
    enabled: !!organizationId && !!academicYearId,
  });

export const useCreateSubject = (organizationId: string) =>
  useRefreshingMutation<Partial<ISubject>>(
    organizationId,
    API_MUTATION_KEY.CREATE_SUBJECT,
    (value) => apiClient.post(`${base(organizationId)}/subject`, value),
    [API_QUERY_KEY.GET_SUBJECTS],
  );

export const useUpdateSubject = (organizationId: string) =>
  useRefreshingMutation<{ id: string } & Partial<ISubject>>(
    organizationId,
    API_MUTATION_KEY.UPDATE_SUBJECT,
    ({ id, ...value }) => apiClient.put(`${base(organizationId)}/subject/${id}`, value),
    [API_QUERY_KEY.GET_SUBJECTS],
  );

export const useDeactivateSubject = (organizationId: string) =>
  useRefreshingMutation<string>(
    organizationId,
    API_MUTATION_KEY.DEACTIVATE_SUBJECT,
    (id) => apiClient.delete(`${base(organizationId)}/subject/${id}`),
    [API_QUERY_KEY.GET_SUBJECTS],
  );

// ── teacher assignments ──

export const useGetTeacherAssignments = (organizationId: string, classId?: string) =>
  useQuery<{ items: ITeacherAssignment[] }, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_TEACHER_ASSIGNMENTS, organizationId, classId],
    queryFn: () => getItems<ITeacherAssignment>(`${base(organizationId)}/teacher-assignment`, { classId }),
    enabled: !!organizationId,
  });

const ASSIGNMENT_LISTS = [API_QUERY_KEY.GET_TEACHER_ASSIGNMENTS, API_QUERY_KEY.GET_SECTIONS];

export const useAssignTeacher = (organizationId: string) =>
  useRefreshingMutation<{
    teacherUserId: string;
    academicYearId: string;
    classId: string;
    sectionId: string;
    subjectId?: string;
    assignmentRole: string;
  }>(
    organizationId,
    API_MUTATION_KEY.ASSIGN_TEACHER,
    (value) => apiClient.post(`${base(organizationId)}/teacher-assignment`, value),
    ASSIGNMENT_LISTS,
  );

export const useRemoveTeacherAssignment = (organizationId: string) =>
  useRefreshingMutation<string>(
    organizationId,
    API_MUTATION_KEY.REMOVE_TEACHER_ASSIGNMENT,
    (id) => apiClient.delete(`${base(organizationId)}/teacher-assignment/${id}`),
    ASSIGNMENT_LISTS,
  );
