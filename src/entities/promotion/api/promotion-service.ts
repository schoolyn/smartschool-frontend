import { useQuery, useMutation, useQueryClient, QueryClient } from "@tanstack/react-query";

import apiClient from "@/shared/api";
import { IAPIError, IAxiosResponse } from "@/shared/types";
import { IPromotionCandidate, IPromotionDecisionResult, IPromotionSectionStats, PromotionAction } from "../model/types";
import { APIS_ROUTES, API_QUERY_KEY } from "@/shared/lib";

const base = (organizationId: string) => `${APIS_ROUTES.STUDENT_PROFILE}/${organizationId}`;

export const candidatesQuery = (organizationId: string, academicYearId: string, sectionId: string) => ({
  queryKey: [API_QUERY_KEY.GET_PROMOTION_CANDIDATES, organizationId, academicYearId, sectionId],
  queryFn: async () => {
    const result = await apiClient.get<null, IAxiosResponse<{ items: IPromotionCandidate[] }>>(
      `${base(organizationId)}/promotion/candidates`,
      { params: { academicYearId, sectionId } }
    );
    return result.data.Data;
  },
});

export const useGetPromotionCandidates = (organizationId: string, academicYearId: string, sectionId: string) =>
  useQuery<{ items: IPromotionCandidate[] }, IAPIError>({
    ...candidatesQuery(organizationId, academicYearId, sectionId),
    enabled: !!organizationId && !!academicYearId && !!sectionId,
  });

export const useGetPromotionOverview = (organizationId: string, academicYearId: string) =>
  useQuery<{ items: IPromotionSectionStats[] }, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_PROMOTION_OVERVIEW, organizationId, academicYearId],
    queryFn: async () => {
      const result = await apiClient.get<null, IAxiosResponse<{ items: IPromotionSectionStats[] }>>(
        `${base(organizationId)}/promotion/overview`,
        { params: { academicYearId } }
      );
      return result.data.Data;
    },
    enabled: !!organizationId && !!academicYearId,
  });

export interface IPromotionDecisionInput {
  studentId: string;
  action: PromotionAction;
  academicYearId?: string;
  classId?: string;
  sectionId?: string;
  rollNumber?: string;
}

export const processDecisions = async (organizationId: string, decisions: IPromotionDecisionInput[]) => {
  const result = await apiClient.post<
    { decisions: IPromotionDecisionInput[] },
    IAxiosResponse<{ items: IPromotionDecisionResult[] }>
  >(`${base(organizationId)}/promotion/process`, { decisions });
  return result.data.Data;
};

// students moved: the candidates, progress, student lists and the sections' head counts all change
export const refreshAfterPromotion = (queryClient: QueryClient, organizationId: string) =>
  [
    API_QUERY_KEY.GET_PROMOTION_CANDIDATES,
    API_QUERY_KEY.GET_PROMOTION_OVERVIEW,
    API_QUERY_KEY.GET_STUDENT_PROFILE,
    API_QUERY_KEY.GET_SECTIONS,
    API_QUERY_KEY.GET_CLASSES,
  ].forEach((key) => queryClient.invalidateQueries({ queryKey: [key, organizationId] }));

export const useProcessPromotions = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation<{ items: IPromotionDecisionResult[] }, IAPIError, IPromotionDecisionInput[]>({
    mutationFn: (decisions) => processDecisions(organizationId, decisions),
    onSuccess: () => refreshAfterPromotion(queryClient, organizationId),
  });
};
