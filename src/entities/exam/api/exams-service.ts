import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "@/shared/api";
import { IAPIError, IAxiosResponse } from "@/shared/types";
import { IGradingScheme, IExam, IExamOverview, IExamSubject, IMarksSheetItem, IResult } from "../model/types";
import { APIS_ROUTES, API_QUERY_KEY, API_MUTATION_KEY, saveFile } from "@/shared/lib";

const base = (organizationId: string) => `${APIS_ROUTES.EXAM_SERVICE}/${organizationId}`;

// every view that shows an exam's setup or progress, refreshed after anything changes it
const refreshExams = (queryClient: ReturnType<typeof useQueryClient>, organizationId: string) =>
  Promise.all(
    [API_QUERY_KEY.GET_EXAMS, API_QUERY_KEY.GET_EXAM_OVERVIEW, API_QUERY_KEY.GET_EXAM_SUBJECTS].map((key) =>
      queryClient.invalidateQueries({ queryKey: [key, organizationId] })
    )
  );

export const useGetGradingSchemes = (organizationId: string) =>
  useQuery<{ items: IGradingScheme[] }, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_GRADING_SCHEMES, organizationId],
    queryFn: async () => {
      const result = await apiClient.get<null, IAxiosResponse<{ items: IGradingScheme[] }>>(
        `${base(organizationId)}/grading-scheme`
      );
      return result.data.Data;
    },
    enabled: !!organizationId,
  });

interface ICreateGradingSchemePayload {
  name: string;
  passPercent: number;
  bands: {
    grade: string;
    minPercent: number;
    maxPercent: number;
    gradePoint: number;
  }[];
}

export const useCreateGradingScheme = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, IAPIError, ICreateGradingSchemePayload>({
    mutationKey: [API_MUTATION_KEY.CREATE_GRADING_SCHEME],
    mutationFn: async (value) => {
      await apiClient.post(`${base(organizationId)}/grading-scheme`, value);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [API_QUERY_KEY.GET_GRADING_SCHEMES, organizationId],
      }),
  });
};

export const useUpdateGradingScheme = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, IAPIError, { schemeId: string } & ICreateGradingSchemePayload>({
    mutationFn: async ({ schemeId, ...value }) => {
      await apiClient.put(`${base(organizationId)}/grading-scheme/${schemeId}`, value);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_GRADING_SCHEMES, organizationId] }),
  });
};

export const useDeleteGradingScheme = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, IAPIError, string>({
    mutationFn: async (schemeId) => {
      await apiClient.delete(`${base(organizationId)}/grading-scheme/${schemeId}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_GRADING_SCHEMES, organizationId] }),
  });
};

export const useGetExams = (organizationId: string) =>
  useQuery<{ items: IExam[] }, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_EXAMS, organizationId],
    queryFn: async () => {
      const result = await apiClient.get<null, IAxiosResponse<{ items: IExam[] }>>(`${base(organizationId)}/exam`);
      return result.data.Data;
    },
    enabled: !!organizationId,
  });

interface ICreateExamPayload {
  academicYearId: string;
  name: string;
  term: string;
  type: string;
  startDate: string;
  endDate: string;
  classIds: string[];
  gradingSchemeId: string;
}

export const useCreateExam = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation<IExam, IAPIError, ICreateExamPayload>({
    mutationKey: [API_MUTATION_KEY.CREATE_EXAM],
    mutationFn: async (value) => {
      const result = await apiClient.post<ICreateExamPayload, IAxiosResponse<{ item: IExam }>>(
        `${base(organizationId)}/exam`,
        value
      );
      return result.data.Data.item;
    },
    onSuccess: () => refreshExams(queryClient, organizationId),
  });
};

interface IAddExamSubjectsPayload {
  examId: string;
  classId: string;
  subjects: {
    subjectId: string;
    maxMarks: number;
    passMarks: number;
    hasPractical?: boolean;
    practicalMaxMarks?: number;
  }[];
}

export const useAddExamSubjects = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, IAPIError, IAddExamSubjectsPayload>({
    mutationKey: [API_MUTATION_KEY.ADD_EXAM_SUBJECTS],
    mutationFn: async (value) => {
      await apiClient.post(`${base(organizationId)}/exam/${value.examId}/subject`, value);
    },
    onSuccess: () => refreshExams(queryClient, organizationId),
  });
};

export const useGetExamSubjects = (organizationId: string, examId?: string, classId?: string) =>
  useQuery<{ items: IExamSubject[] }, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_EXAM_SUBJECTS, organizationId, examId, classId],
    queryFn: async () => {
      const result = await apiClient.get<null, IAxiosResponse<{ items: IExamSubject[] }>>(
        `${base(organizationId)}/exam/${examId}/subject`,
        {
          params: classId ? { classId } : undefined,
        }
      );
      return result.data.Data;
    },
    enabled: !!organizationId && !!examId,
  });

// one exam with its classes, their subjects and how far marks are
export const useGetExamOverview = (organizationId: string, examId?: string) =>
  useQuery<IExamOverview, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_EXAM_OVERVIEW, organizationId, examId],
    queryFn: async () => {
      const result = await apiClient.get<null, IAxiosResponse<IExamOverview>>(
        `${base(organizationId)}/exam/${examId}/overview`
      );
      return result.data.Data;
    },
    enabled: !!organizationId && !!examId,
  });

export const useUpdateExam = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, IAPIError, { examId: string } & Partial<ICreateExamPayload>>({
    mutationFn: async ({ examId, ...value }) => {
      await apiClient.patch(`${base(organizationId)}/exam/${examId}`, value);
    },
    onSuccess: () => refreshExams(queryClient, organizationId),
  });
};

export const useDeleteExam = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, IAPIError, string>({
    mutationFn: async (examId) => {
      await apiClient.delete(`${base(organizationId)}/exam/${examId}`);
    },
    onSuccess: () => refreshExams(queryClient, organizationId),
  });
};

export interface IUpdateExamSubjectPayload {
  examSubjectId: string;
  maxMarks: number;
  passMarks: number;
  hasPractical: boolean;
  practicalMaxMarks: number;
}

export const useUpdateExamSubject = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, IAPIError, IUpdateExamSubjectPayload>({
    mutationFn: async ({ examSubjectId, ...value }) => {
      await apiClient.patch(`${base(organizationId)}/exam-subject/${examSubjectId}`, value);
    },
    onSuccess: () => refreshExams(queryClient, organizationId),
  });
};

export const useDeleteExamSubject = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, IAPIError, string>({
    mutationFn: async (examSubjectId) => {
      await apiClient.delete(`${base(organizationId)}/exam-subject/${examSubjectId}`);
    },
    onSuccess: () => refreshExams(queryClient, organizationId),
  });
};

export const useGetMarksSheet = (organizationId: string, examSubjectId?: string, sectionId?: string) =>
  useQuery<{ items: IMarksSheetItem[]; examSubject: IExamSubject }, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_MARKS_SHEET, organizationId, examSubjectId, sectionId],
    queryFn: async () => {
      const result = await apiClient.get<null, IAxiosResponse<{ items: IMarksSheetItem[]; examSubject: IExamSubject }>>(
        `${base(organizationId)}/exam-subject/${examSubjectId}/marks-sheet`,
        {
          params: { sectionId },
        }
      );
      return result.data.Data;
    },
    enabled: !!organizationId && !!examSubjectId && !!sectionId,
  });

interface ISaveMarksPayload {
  examSubjectId: string;
  sectionId: string;
  // an absent student is sent without marks
  entries: {
    studentId: string;
    theoryMarks?: number;
    practicalMarks?: number;
    isAbsent?: boolean;
  }[];
}

export const useSaveMarks = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, IAPIError, ISaveMarksPayload>({
    mutationKey: [API_MUTATION_KEY.SAVE_MARKS],
    mutationFn: async (value) => {
      await apiClient.post(`${base(organizationId)}/exam-subject/${value.examSubjectId}/marks`, value);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [API_QUERY_KEY.GET_MARKS_SHEET, organizationId, variables.examSubjectId, variables.sectionId],
      });
      refreshExams(queryClient, organizationId);
    },
  });
};

export const useVerifyExamSubjectMarks = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, IAPIError, string>({
    mutationKey: [API_MUTATION_KEY.VERIFY_EXAM_SUBJECT_MARKS],
    mutationFn: async (examSubjectId) => {
      await apiClient.post(`${base(organizationId)}/exam-subject/${examSubjectId}/verify`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [API_QUERY_KEY.GET_MARKS_SHEET, organizationId],
      });
      refreshExams(queryClient, organizationId);
    },
  });
};

export const usePublishExam = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, IAPIError, string>({
    mutationKey: [API_MUTATION_KEY.PUBLISH_EXAM],
    mutationFn: async (examId) => {
      await apiClient.post(`${base(organizationId)}/exam/${examId}/publish`);
    },
    onSuccess: () => {
      refreshExams(queryClient, organizationId);
      queryClient.invalidateQueries({
        queryKey: [API_QUERY_KEY.GET_ATTENTION, organizationId],
      });
    },
  });
};

export const useGetResultsForStudent = (organizationId: string, studentId?: string) =>
  useQuery<{ items: IResult[] }, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_RESULTS_FOR_STUDENT, organizationId, studentId],
    queryFn: async () => {
      const result = await apiClient.get<null, IAxiosResponse<{ items: IResult[] }>>(
        `${base(organizationId)}/student/${studentId}/results`
      );
      return result.data.Data;
    },
    enabled: !!organizationId && !!studentId,
  });

export const useGetMyResults = (organizationId: string) =>
  useQuery<{ items: { studentId: string; studentName: string; results: IResult[] }[] }, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_MY_RESULTS, organizationId],
    queryFn: async () => {
      const result = await apiClient.get<
        null,
        IAxiosResponse<{
          items: {
            studentId: string;
            studentName: string;
            results: IResult[];
          }[];
        }>
      >(`${base(organizationId)}/my-results`);
      return result.data.Data;
    },
    enabled: !!organizationId,
  });

// not a query/mutation hook - a report card is a PDF blob, not envelope JSON
export const downloadReportCard = async (organizationId: string, examId: string, studentId: string) => {
  const result = await apiClient.get(`${base(organizationId)}/exam/${examId}/student/${studentId}/report-card`, {
    responseType: "blob",
  });
  saveFile(result.data, `report-card-${studentId}.pdf`, "application/pdf");
};

// emails the same PDF to the caller's own registered address - no arbitrary recipient
export const useEmailReportCard = (organizationId: string) =>
  useMutation<void, IAPIError, { examId: string; studentId: string }>({
    mutationKey: [API_MUTATION_KEY.EMAIL_REPORT_CARD],
    mutationFn: async ({ examId, studentId }) => {
      await apiClient.post(`${base(organizationId)}/exam/${examId}/student/${studentId}/report-card/email`);
    },
  });
