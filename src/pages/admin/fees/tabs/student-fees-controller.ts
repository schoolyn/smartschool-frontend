import { useState } from "react";
import toast from "react-hot-toast";

import { useDebouncedValue, useError } from "@/shared/lib/hooks";
import { useGetStudentDetails } from "@/entities/student";
import { useGetStudentFeeSummary, useReversePayment } from "@/entities/fee";

const useStudentFeesController = (organizationId: string) => {
  const [search, setSearch] = useState("");
  const [studentId, setStudentId] = useState("");
  const [paymentToReverse, setPaymentToReverse] = useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(search.trim());
  const students = useGetStudentDetails(organizationId, "all", debouncedSearch, 10, 1);
  const feeSummary = useGetStudentFeeSummary(organizationId, studentId);
  const reversePayment = useReversePayment(organizationId);
  useError({ mutation: reversePayment });

  // reversing cannot be undone, so it is confirmed first
  const confirmReverse = () => {
    if (!paymentToReverse) return;
    reversePayment.mutate(paymentToReverse, {
      onSuccess: () => {
        toast.success("Payment reversed.");
        setPaymentToReverse(null);
      },
    });
  };

  return {
    search,
    setSearch,
    debouncedSearch,
    students: students.data?.rows ?? [],
    isLoadingStudents: students.isLoading,
    studentId,
    setStudentId,
    summaries: feeSummary.data?.items ?? [],
    isLoadingSummary: feeSummary.isLoading,
    summaryError: feeSummary.isError ? feeSummary.error : null,
    retrySummary: () => feeSummary.refetch(),
    paymentToReverse,
    setPaymentToReverse,
    confirmReverse,
    isReversing: reversePayment.isPending,
  };
};

export default useStudentFeesController;
