import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "@/shared/api";
import { IAPIError, IAxiosResponse } from "@/shared/types";
import { APIS_ROUTES } from "@/shared/lib";

export type SupportTopic = "fees" | "attendance" | "login" | "bug" | "other";
export type SupportStatus = "open" | "waiting_on_school" | "resolved";

export interface SupportRequest {
  _id: string;
  number: number;
  topic: SupportTopic;
  subject: string;
  status: SupportStatus;
  lastMessageAt: string;
  lastMessageFrom: "school" | "support";
  requesterId?: { name?: string; email?: string };
  createdAt: string;
}

export interface SupportMessage {
  _id: string;
  from: "school" | "support";
  body: string;
  createdAt: string;
  authorId?: { name?: string };
  attachment?: { originalName?: string };
}

export interface SupportThread extends SupportRequest {
  messages: SupportMessage[];
}

const base = (organizationId: string) => `${APIS_ROUTES.SUPPORT_SERVICE}/${organizationId}/requests`;
const LIST_KEY = "get-support-requests";
const THREAD_KEY = "get-support-thread";
// an open thread refreshes on its own
const LIVE_MS = 15_000;

const toFormData = (fields: Record<string, string | File | null | undefined>) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) if (value) data.append(key, value);
  return data;
};

export const useSupportRequests = (organizationId: string) =>
  useQuery<SupportRequest[], IAPIError>({
    queryKey: [LIST_KEY, organizationId],
    queryFn: async () =>
      (await apiClient.get<null, IAxiosResponse<{ items: SupportRequest[] }>>(base(organizationId))).data.Data.items,
    enabled: !!organizationId,
  });

export const useSupportThread = (organizationId: string, requestId: string) =>
  useQuery<SupportThread, IAPIError>({
    queryKey: [THREAD_KEY, organizationId, requestId],
    queryFn: async () =>
      (await apiClient.get<null, IAxiosResponse<{ item: SupportThread }>>(`${base(organizationId)}/${requestId}`)).data
        .Data.item,
    enabled: !!organizationId && !!requestId,
    refetchInterval: LIVE_MS,
  });

export interface NewSupportRequest {
  topic: SupportTopic;
  subject: string;
  body: string;
  screenshot: File | null;
  page: string;
}

export const useCreateSupportRequest = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation<SupportRequest, IAPIError, NewSupportRequest>({
    mutationFn: async (value) =>
      (
        await apiClient.post<null, IAxiosResponse<{ item: SupportRequest }>>(
          base(organizationId),
          toFormData({ ...value, platform: "web" })
        )
      ).data.Data.item,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [LIST_KEY, organizationId] }),
  });
};

export const useReplyToSupportRequest = (organizationId: string, requestId: string) => {
  const queryClient = useQueryClient();
  return useMutation<SupportThread, IAPIError, { body: string; screenshot: File | null }>({
    mutationFn: async (value) =>
      (
        await apiClient.post<null, IAxiosResponse<{ item: SupportThread }>>(
          `${base(organizationId)}/${requestId}/messages`,
          toFormData(value)
        )
      ).data.Data.item,
    onSuccess: (item) => {
      queryClient.setQueryData([THREAD_KEY, organizationId, requestId], item);
      queryClient.invalidateQueries({ queryKey: [LIST_KEY, organizationId] });
    },
  });
};

export const openSupportAttachment = async (organizationId: string, requestId: string, messageId: string) => {
  const result = await apiClient.get<null, IAxiosResponse<{ item: { url: string } }>>(
    `${base(organizationId)}/${requestId}/messages/${messageId}/attachment`
  );
  window.open(result.data.Data.item.url, "_blank", "noopener");
};
