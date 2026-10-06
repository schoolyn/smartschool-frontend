import { useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "@/config";
import { IAPIError, IAxiosResponse, IFeeHead, IFeeStructure, IStudentFeeSummary, IPayment } from "@/types";
import { APIS_ROUTES, API_QUERY_KEY, API_MUTATION_KEY } from "@/utils";

const base = (organizationId: string) => `${APIS_ROUTES.FEE_SERVICE}/${organizationId}`;

export const useGetFeeHeads = (organizationId: string) =>
  useQuery<{ items: IFeeHead[] }, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_FEE_HEADS, organizationId],
    queryFn: async () => {
      const result = await apiClient.get<null, IAxiosResponse<{ items: IFeeHead[] }>>(
        `${base(organizationId)}/fee-head`
      );
      return result.data.Data;
    },
    enabled: !!organizationId,
  });

export const useCreateFeeHead = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, IAPIError, { name: string; code: string; category: string; isRefundable: boolean }>({
    mutationKey: [API_MUTATION_KEY.CREATE_FEE_HEAD],
    mutationFn: async (value) => {
      await apiClient.post(`${base(organizationId)}/fee-head`, value);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_FEE_HEADS, organizationId] }),
  });
};

export const useGetFeeStructures = (organizationId: string) =>
  useQuery<{ items: IFeeStructure[] }, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_FEE_STRUCTURES, organizationId],
    queryFn: async () => {
      const result = await apiClient.get<null, IAxiosResponse<{ items: IFeeStructure[] }>>(
        `${base(organizationId)}/fee-structure`
      );
      return result.data.Data;
    },
    enabled: !!organizationId,
  });

interface ICreateFeeStructurePayload {
  academicYearId: string;
  name: string;
  classIds: string[];
  sectionIds: string[];
  items: { feeHeadId: string; amount: number }[];
  installments: { label: string; dueDate: string; amount: number }[];
}

export const useCreateFeeStructure = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, IAPIError, ICreateFeeStructurePayload>({
    mutationKey: [API_MUTATION_KEY.CREATE_FEE_STRUCTURE],
    mutationFn: async (value) => {
      await apiClient.post(`${base(organizationId)}/fee-structure`, value);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_FEE_STRUCTURES, organizationId] }),
  });
};

export const useAssignFeeStructure = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation<{ assigned_count: number; skipped_count: number }, IAPIError, string>({
    mutationKey: [API_MUTATION_KEY.ASSIGN_FEE_STRUCTURE],
    mutationFn: async (feeStructureId) => {
      const result = await apiClient.post<null, IAxiosResponse<{ assigned_count: number; skipped_count: number }>>(
        `${base(organizationId)}/fee-structure/${feeStructureId}/assign`
      );
      return result.data.Data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_STUDENT_FEE_SUMMARY, organizationId] }),
  });
};

export const useGetStudentFeeSummary = (organizationId: string, studentId?: string) =>
  useQuery<{ items: IStudentFeeSummary[] }, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_STUDENT_FEE_SUMMARY, organizationId, studentId],
    queryFn: async () => {
      const result = await apiClient.get<null, IAxiosResponse<{ items: IStudentFeeSummary[] }>>(
        `${base(organizationId)}/student-fee/${studentId}`
      );
      return result.data.Data;
    },
    enabled: !!organizationId && !!studentId,
  });

export const useGetMyFees = (organizationId: string) =>
  useQuery<{ items: IStudentFeeSummary[] }, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_MY_FEES, organizationId],
    queryFn: async () => {
      const result = await apiClient.get<null, IAxiosResponse<{ items: IStudentFeeSummary[] }>>(
        `${base(organizationId)}/my-fees`
      );
      return result.data.Data;
    },
    enabled: !!organizationId,
  });

interface IRecordPaymentPayload {
  studentFeeId: string;
  amount: number;
  method: string;
  instrumentRef?: string;
  remarks?: string;
}

// the backend requires an Idempotency-Key on this route — the same key must survive
// a double-click or a retried request (so the backend can recognize it as the same
// attempt and replay the original response instead of recording a second payment),
// so it's held in a ref for the mutation's lifetime and only rotated after a
// successful submit, not regenerated on every call
export const useRecordPayment = (organizationId: string) => {
  const queryClient = useQueryClient();
  const idempotencyKeyRef = useRef(crypto.randomUUID());
  return useMutation<void, IAPIError, IRecordPaymentPayload>({
    mutationKey: [API_MUTATION_KEY.RECORD_PAYMENT],
    mutationFn: async (value) => {
      await apiClient.post(`${base(organizationId)}/payment`, value, {
        headers: { "Idempotency-Key": idempotencyKeyRef.current },
      });
    },
    onSuccess: () => {
      idempotencyKeyRef.current = crypto.randomUUID();
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_STUDENT_FEE_SUMMARY, organizationId] });
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_PAYMENT_LEDGER, organizationId] });
    },
  });
};

export const useReversePayment = (organizationId: string) => {
  const queryClient = useQueryClient();
  const idempotencyKeyRef = useRef(crypto.randomUUID());
  return useMutation<void, IAPIError, string>({
    mutationKey: [API_MUTATION_KEY.REVERSE_PAYMENT],
    mutationFn: async (paymentId) => {
      await apiClient.post(
        `${base(organizationId)}/payment/${paymentId}/reverse`,
        {},
        { headers: { "Idempotency-Key": idempotencyKeyRef.current } }
      );
    },
    onSuccess: () => {
      idempotencyKeyRef.current = crypto.randomUUID();
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_STUDENT_FEE_SUMMARY, organizationId] });
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_PAYMENT_LEDGER, organizationId] });
    },
  });
};

export const useGetPaymentLedger = (organizationId: string) =>
  useQuery<{ items: IPayment[]; total_count: number }, IAPIError>({
    queryKey: [API_QUERY_KEY.GET_PAYMENT_LEDGER, organizationId],
    queryFn: async () => {
      const result = await apiClient.get<null, IAxiosResponse<{ items: IPayment[]; total_count: number }>>(
        `${base(organizationId)}/payment`
      );
      return result.data.Data;
    },
    enabled: !!organizationId,
  });

export const downloadFeeReceipt = async (organizationId: string, paymentId: string) => {
  const result = await apiClient.get(`${base(organizationId)}/payment/${paymentId}/receipt`, { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([result.data], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `receipt-${paymentId}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// emails the same PDF to the caller's own registered address — no arbitrary recipient
export const useEmailFeeReceipt = (organizationId: string) =>
  useMutation<void, IAPIError, string>({
    mutationKey: [API_MUTATION_KEY.EMAIL_FEE_RECEIPT],
    mutationFn: async (paymentId) => {
      await apiClient.post(`${base(organizationId)}/payment/${paymentId}/receipt/email`);
    },
  });

interface IGrantConcessionPayload {
  studentFeeId: string;
  amount: number;
  reason: string;
  installmentLabel?: string;
}

// same idempotency-key-per-attempt convention as record/reverse payment above —
// a double-click reuses the same key, so a retried request replays instead of double-granting
export const useGrantConcession = (organizationId: string) => {
  const queryClient = useQueryClient();
  const idempotencyKeyRef = useRef(crypto.randomUUID());
  return useMutation<void, IAPIError, IGrantConcessionPayload>({
    mutationKey: [API_MUTATION_KEY.GRANT_CONCESSION],
    mutationFn: async ({ studentFeeId, ...value }) => {
      await apiClient.post(`${base(organizationId)}/student-fee/${studentFeeId}/concession`, value, {
        headers: { "Idempotency-Key": idempotencyKeyRef.current },
      });
    },
    onSuccess: () => {
      idempotencyKeyRef.current = crypto.randomUUID();
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_STUDENT_FEE_SUMMARY, organizationId] });
    },
  });
};
