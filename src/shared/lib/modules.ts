import { ModuleKey } from "@/shared/types";

export const MODULE_LABELS: Record<ModuleKey, string> = {
  attendance: "Attendance",
  homework: "Homework",
  timetable: "Timetable",
  leave: "Leave requests",
  exams: "Exams & results",
  fees: "Fees",
  onlinePayments: "Online payments",
  notices: "Notices",
  calendar: "Calendar",
  ptm: "PTM",
  certificates: "Certificates",
};

export const ALL_MODULES = Object.keys(MODULE_LABELS) as ModuleKey[];
