export interface ILeaveRequest {
  id: string;
  studentId: { id: string; name: string } | string;
  requestedByUserId: { id: string; name: string; email: string } | string;
  classId: string;
  sectionId: string;
  fromDate: string;
  toDate: string;
  reason: string;
  attachmentURL: string | null;
  status: "pending" | "approved" | "rejected" | "cancelled";
  decidedBy?: string;
  decisionNote?: string;
  decidedAt?: string;
  createdAt: string;
}
