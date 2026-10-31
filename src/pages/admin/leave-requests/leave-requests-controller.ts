import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { useGetLeaveRequestsReviewQueue, useDecideLeaveRequest } from "@/entities/leave-request";

export const useLeaveRequestsController = () => {
  const { organizationId = "" } = useParams();

  const [status, setStatus] = useState("pending");
  const [notesByRequest, setNotesByRequest] = useState<Record<string, string>>({});

  const reviewQueue = useGetLeaveRequestsReviewQueue(organizationId, status);
  const decideLeaveRequest = useDecideLeaveRequest(organizationId, status);

  const setNote = (leaveRequestId: string, note: string) =>
    setNotesByRequest((prev) => ({ ...prev, [leaveRequestId]: note }));

  const handleDecide = (leaveRequestId: string, decision: "approved" | "rejected") => {
    decideLeaveRequest.mutate(
      { leaveRequestId, status: decision, decisionNote: notesByRequest[leaveRequestId] },
      { onSuccess: () => toast.success(decision === "approved" ? "Leave approved." : "Leave declined.") }
    );
  };

  useEffect(() => {
    if (decideLeaveRequest.isError) {
      toast.error(decideLeaveRequest.error?.response?.Error?.message || "Failed to record decision");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decideLeaveRequest.isError]);

  return {
    status,
    setStatus,
    leaveRequests: reviewQueue.data?.items || [],
    isLoading: reviewQueue.isLoading,
    notesByRequest,
    setNote,
    handleDecide,
    isDeciding: decideLeaveRequest.isPending,
    decidingRequestId: decideLeaveRequest.variables?.leaveRequestId,
  };
};
