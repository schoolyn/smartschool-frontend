export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export interface IAttendanceRecord {
  id: string;
  studentId: { id: string; name: string } | string;
  status: AttendanceStatus;
  reason?: string;
  date?: string;
}

export interface IAttendanceSession {
  id: string;
  sectionId: string;
  date: string;
  status: string;
  summary: { present: number; absent: number; late: number; excused: number; total: number };
}
