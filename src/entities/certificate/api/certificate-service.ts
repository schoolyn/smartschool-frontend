import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "@/shared/api";
import { CertificateType, ICertificate, ICertificateDraft } from "../model/types";
import { IAPIError, IAxiosResponse, Paged } from "@/shared/types";
import { API_MUTATION_KEY, API_QUERY_KEY, APIS_ROUTES, saveFile } from "@/shared/lib";

const base = (organizationId: string) => `${APIS_ROUTES.CERTIFICATE_SERVICE}/${organizationId}`;

export interface CertificateFilters {
  type?: CertificateType;
  search?: string;
  studentId?: string;
}

export const useCertificateDraft = (organizationId: string, studentId: string, type: CertificateType) =>
  useQuery<ICertificateDraft, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_CERTIFICATE_DRAFT, organizationId, studentId, type],
    queryFn: async () => {
      const result = await apiClient.get<null, IAxiosResponse<ICertificateDraft>>(`${base(organizationId)}/draft`, {
        params: { studentId, type },
      });
      return result.data.Data;
    },
    enabled: !!organizationId && !!studentId,
  });

export const useCertificates = (
  organizationId: string,
  page: number,
  limit: number,
  filters: CertificateFilters,
  enabled = true
) =>
  useQuery<Paged<ICertificate>, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_CERTIFICATES, organizationId, page, limit, filters],
    queryFn: async () => {
      const result = await apiClient.get<null, IAxiosResponse<Paged<ICertificate>>>(`${base(organizationId)}/list`, {
        params: { page, limit, ...filters },
      });
      return result.data.Data;
    },
    enabled: !!organizationId && enabled,
    placeholderData: keepPreviousData,
  });

export interface IssueCertificateInput {
  type: CertificateType;
  body: Record<string, unknown>;
}

// a TC also ends the enrollment, so student lists refresh too
export const useIssueCertificate = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation<ICertificate, IAPIError, IssueCertificateInput>({
    mutationKey: [API_MUTATION_KEY.ISSUE_CERTIFICATE],
    mutationFn: async ({ type, body }) => {
      const result = await apiClient.post<null, IAxiosResponse<{ item: ICertificate }>>(
        `${base(organizationId)}/${type}`,
        body
      );
      return result.data.Data.item;
    },
    onSuccess: (_item, { type }) => {
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_CERTIFICATES] });
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_CERTIFICATE_DRAFT] });
      if (type === "transfer") queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_STUDENT_PROFILE] });
    },
  });
};

const fileName = (certificate: ICertificate) =>
  `${certificate.number.replace(/\//g, "-")}-${certificate.studentName.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pdf`;

export const downloadCertificatePdf = async (organizationId: string, certificate: ICertificate) => {
  const result = await apiClient.get(`${base(organizationId)}/${certificate.id}/pdf`, { responseType: "blob" });
  saveFile(result.data, fileName(certificate), "application/pdf");
};

// counted as a duplicate on the server; the copy is watermarked
export const useDuplicateCertificate = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, IAPIError, ICertificate>({
    mutationKey: [API_MUTATION_KEY.DUPLICATE_CERTIFICATE],
    mutationFn: async (certificate) => {
      const result = await apiClient.post(
        `${base(organizationId)}/${certificate.id}/duplicate`,
        {},
        {
          responseType: "blob",
        }
      );
      saveFile(result.data, fileName(certificate).replace(".pdf", "-duplicate.pdf"), "application/pdf");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_CERTIFICATES] }),
  });
};

export const downloadCertificatesCsv = async (organizationId: string, filters: CertificateFilters, limit: number) => {
  const result = await apiClient.get(`${base(organizationId)}/export`, {
    params: { ...filters, limit },
    responseType: "blob",
  });
  saveFile(result.data, "certificates.csv");
};
