import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { useError } from "@/shared/lib/hooks";
import { useGetMyChildren } from "@/entities/student";
import { useGetMyLeaveRequests, useCreateLeaveRequest, useCancelLeaveRequest } from "@/entities/leave-request";
import { leaveRequestFormSchema, defaultLeaveRequestFormValues } from "./leave-requests.schema";

export const useLeaveRequestsController = () => {
  const { organizationId = "" } = useParams();

  const [showForm, setShowForm] = useState(false);
  const form = useForm({
    resolver: zodResolver(leaveRequestFormSchema),
    defaultValues: defaultLeaveRequestFormValues,
  });
  const [leaveRequestIdPendingCancel, setLeaveRequestIdPendingCancel] = useState<string | null>(null);

  const children = useGetMyChildren(organizationId);
  const leaveRequests = useGetMyLeaveRequests(organizationId);
  const createLeaveRequest = useCreateLeaveRequest(organizationId);
  const cancelLeaveRequest = useCancelLeaveRequest(organizationId);
  useError({ mutation: cancelLeaveRequest });

  const onSubmit = form.handleSubmit((values) => {
    const formData = new FormData();
    formData.append("studentId", values.studentId);
    formData.append("fromDate", values.fromDate);
    formData.append("toDate", values.toDate);
    formData.append("reason", values.reason);
    if (values.attachment) formData.append("attachment", values.attachment);

    createLeaveRequest.mutate(formData);
  });

  useEffect(() => {
    if (createLeaveRequest.isSuccess) {
      toast.success("Leave request submitted.");
      setShowForm(false);
      form.reset(defaultLeaveRequestFormValues);
    }
    if (createLeaveRequest.isError) {
      toast.error(createLeaveRequest.error?.response?.Error?.message || "Failed to submit leave request");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createLeaveRequest.isSuccess, createLeaveRequest.isError]);

  const handleCancel = (leaveRequestId: string) => setLeaveRequestIdPendingCancel(leaveRequestId);
  const cancelDialogClose = () => setLeaveRequestIdPendingCancel(null);
  const confirmCancel = () => {
    if (!leaveRequestIdPendingCancel) return;
    cancelLeaveRequest.mutate(leaveRequestIdPendingCancel, {
      onSuccess: () => setLeaveRequestIdPendingCancel(null),
    });
  };

  return {
    children: children.data?.items || [],
    leaveRequests: leaveRequests.data?.items || [],
    isLoading: leaveRequests.isLoading,
    showForm,
    setShowForm,
    toggleForm: () => setShowForm((open) => !open),
    form,
    onSubmit,
    isCreating: createLeaveRequest.isPending,
    handleCancel,
    leaveRequestIdPendingCancel,
    cancelDialogClose,
    confirmCancel,
    isCancelling: cancelLeaveRequest.isPending,
  };
};
