import { BadgeTone } from "@/shared/ui/kit/badge";
import { SupportStatus, SupportTopic } from "../api/support-service";

export const TOPIC_OPTIONS: { id: SupportTopic; name: string }[] = [
  { id: "bug", name: "Something isn't working" },
  { id: "fees", name: "Fees and payments" },
  { id: "attendance", name: "Attendance" },
  { id: "login", name: "Signing in" },
  { id: "other", name: "Something else" },
];

export const STATUS: Record<SupportStatus, { label: string; tone: BadgeTone }> = {
  open: { label: "Waiting on Opscul", tone: "yellow" },
  waiting_on_school: { label: "Opscul replied", tone: "blue" },
  resolved: { label: "Resolved", tone: "green" },
};
