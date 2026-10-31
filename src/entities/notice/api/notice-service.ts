import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import apiClient from "@/shared/api";
import { IAPIError, IAxiosResponse, Paged } from "@/shared/types";
import { ICreateNoticeRequest } from "../model/types";
import { API_MUTATION_KEY, API_QUERY_KEY, APIS_ROUTES } from "@/shared/lib";

interface ICreatNoticeResponse {
  // "Notice created successfully." or "Notice scheduled successfully."
  message?: string;
  id: string;
  title: string;
  content: string;
  date: string;
  type: string;
  attachment?: File | null;
}

const createNotice = async (organizationId: string, data: FormData | ICreateNoticeRequest) => {
  const response = await apiClient.post<ICreateNoticeRequest, IAxiosResponse<ICreatNoticeResponse>>(
    `${APIS_ROUTES.SCHOOL_SERVICE}/notice/${organizationId}/create-notice`,
    data
  );

  return response.data.Data;
};

export const useCreateNotice = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation<ICreatNoticeResponse, IAPIError, FormData | ICreateNoticeRequest>({
    mutationKey: [API_MUTATION_KEY.CREATE_NOTICE],
    mutationFn: (data: FormData | ICreateNoticeRequest) => createNotice(organizationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_NOTICE_LIST, organizationId] });
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_MY_NOTICES] });
    },
  });
};

const deleteNotice = async (organizationId: string, noticeID: string) => {
  await apiClient.delete(`${APIS_ROUTES.SCHOOL_SERVICE}/notice/${organizationId}/delete-notice/${noticeID}`);
};

export const useDeleteNotice = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, IAPIError, string>({
    mutationKey: [API_MUTATION_KEY.DELETE_NOTICE],
    mutationFn: (noticeID) => deleteNotice(organizationId, noticeID),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_NOTICE_LIST, organizationId] });
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_MY_NOTICES] });
    },
  });
};

interface INoticeResponse {
  id: string;
  title: string;
  content: string;
  date: string;
  type: "holiday" | "announcement";
  createdAt: string;
  updatedAt: string;
  attachmentURL: string;
}

const getNoticeList = async (
  organizationId: string | undefined,
  searchTerm: string,
  type: string,
  limit: number,
  page: number
): Promise<Paged<INoticeResponse>> => {
  if (!organizationId) {
    return {
      rows: [],
      pagination: {
        currentPage: 1,
        totalItems: 0,
        itemsPerPage: limit,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }

  const result = await apiClient.get<null, IAxiosResponse<Paged<INoticeResponse>>>(
    `${APIS_ROUTES.SCHOOL_SERVICE}/notice/${organizationId}/get-notice-list`,
    {
      params: {
        search_term: searchTerm,
        type: type,
        limit: limit,
        page: page,
      },
    }
  );

  return result.data.Data;
};

export const useGetNoticeList = (
  organizationId: string | undefined,
  searchTerm: string,
  type: string,
  limit: number,
  page: number
) =>
  useQuery<Paged<INoticeResponse>, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_NOTICE_LIST, organizationId, searchTerm, type, limit, page],
    queryFn: () => getNoticeList(organizationId, searchTerm, type, limit, page),
    enabled: !!organizationId,
  });
