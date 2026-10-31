import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import apiClient from "@/shared/api";
import { IAPIError, IAxiosResponse, Paged } from "@/shared/types";
import { IHomework } from "../model/types";
import { APIS_ROUTES, API_QUERY_KEY, API_MUTATION_KEY } from "@/shared/lib";

const base = (organizationId: string) => `${APIS_ROUTES.HOMEWORK_SERVICE}/${organizationId}`;

export const useGetHomeworkList = (organizationId: string, sectionId: string) =>
  useQuery<Paged<IHomework>, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_HOMEWORK_LIST, organizationId, sectionId],
    queryFn: async () => {
      const result = await apiClient.get<null, IAxiosResponse<Paged<IHomework>>>(`${base(organizationId)}/list`, {
        params: { sectionId },
      });
      return result.data.Data;
    },
    enabled: !!organizationId && !!sectionId,
  });

export const useCreateHomework = (organizationId: string, sectionId: string) => {
  const queryClient = useQueryClient();
  return useMutation<IHomework, IAPIError, FormData>({
    mutationKey: [API_MUTATION_KEY.CREATE_HOMEWORK],
    mutationFn: async (data) => {
      const result = await apiClient.post<FormData, IAxiosResponse<{ item: IHomework }>>(
        `${base(organizationId)}/create`,
        data
      );
      return result.data.Data.item;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_HOMEWORK_LIST, organizationId, sectionId] }),
  });
};

export const useDeleteHomework = (organizationId: string, sectionId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, IAPIError, string>({
    mutationKey: [API_MUTATION_KEY.DELETE_HOMEWORK],
    mutationFn: async (homeworkId) => {
      await apiClient.delete(`${base(organizationId)}/${homeworkId}`);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_HOMEWORK_LIST, organizationId, sectionId] }),
  });
};
