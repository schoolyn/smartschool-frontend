export interface INotification {
  id: string;
  organizationId?: string;
  type: string;
  title: string;
  body: string;
  entityType?: string;
  entityId?: string;
  readAt: string | null;
  createdAt: string;
}

export interface IEmailLog {
  id: string;
  recipientEmail: string;
  type: string;
  subject: string;
  status: "queued" | "sent" | "failed" | "skipped";
  reason?: string;
  createdAt: string;
}
