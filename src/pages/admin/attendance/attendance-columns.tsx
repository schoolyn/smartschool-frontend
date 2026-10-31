import { DataTableColumn } from "@/shared/ui/data-table";
import { Input } from "@/shared/ui/kit/input";
import { cn } from "@/shared/lib/utils";
import { AttendanceStatus } from "@/entities/attendance";
import { percent } from "./attendance-controller";
import { ISectionAttendanceReportRow, ISectionRosterStudent } from "@/entities/attendance";

const STATUSES: AttendanceStatus[] = ["present", "absent", "late", "excused"];

const STATUS_STYLES: Record<AttendanceStatus, string> = {
  present: "bg-green-100 text-green-800 border-green-300",
  absent: "bg-red-100 text-red-800 border-red-300",
  late: "bg-amber-100 text-amber-800 border-amber-300",
  excused: "bg-gray-100 text-gray-800 border-gray-300",
};

interface RosterColumnProps {
  statuses: Record<string, AttendanceStatus>;
  reasons: Record<string, string>;
  setStatus: (studentId: string, status: AttendanceStatus) => void;
  setReason: (studentId: string, reason: string) => void;
}

// a register row: roll, name, one tap to change the mark, and a reason only when it isn't present
export const rosterColumns = ({
  statuses,
  reasons,
  setStatus,
  setReason,
}: RosterColumnProps): DataTableColumn<ISectionRosterStudent>[] => [
  {
    id: "roll",
    header: "Roll",
    meta: { className: "w-16 text-gray-500" },
    cell: ({ row }) => row.original.currentEnrollment?.rollNumber || "-",
  },
  {
    id: "student",
    header: "Student",
    cell: ({ row }) => <span className="font-medium text-gray-900">{row.original.name}</span>,
  },
  {
    id: "status",
    header: "Attendance",
    meta: { align: "center" },
    cell: ({ row: { original: student } }) => {
      const current = statuses[student.id] || "present";
      return (
        <div
          role="radiogroup"
          aria-label={`Attendance for ${student.name}`}
          className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5"
        >
          {STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              role="radio"
              aria-checked={current === status}
              onClick={() => setStatus(student.id, status)}
              className={cn(
                "rounded-md border px-3 py-1 text-xs font-medium capitalize transition-colors",
                current === status ? STATUS_STYLES[status] : "border-transparent text-gray-500 hover:text-gray-800"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      );
    },
  },
  {
    id: "reason",
    header: "Reason",
    meta: { align: "center", className: "w-64" },
    cell: ({ row: { original: student } }) =>
      (statuses[student.id] || "present") === "present" ? (
        <span className="text-gray-300">-</span>
      ) : (
        <Input
          type="text"
          placeholder="Reason (optional)"
          aria-label={`Reason for ${student.name}`}
          className="mx-auto h-8 max-w-56 px-2 py-1 text-xs"
          value={reasons[student.id] || ""}
          onChange={(e) => setReason(student.id, e.target.value)}
        />
      ),
  },
];

export const reportColumns: DataTableColumn<ISectionAttendanceReportRow>[] = [
  {
    id: "rollNumber",
    header: "Roll No.",
    meta: { className: "text-gray-500" },
    cell: ({ row }) => row.original.rollNumber,
  },
  {
    id: "student",
    header: "Student",
    cell: ({ row }) => <span className="font-medium text-gray-900">{row.original.studentName}</span>,
  },
  {
    id: "present",
    header: "Present",
    meta: { align: "center" },
    cell: ({ row }) => <span className="text-green-700">{row.original.present}</span>,
  },
  {
    id: "absent",
    header: "Absent",
    meta: { align: "center" },
    cell: ({ row }) => <span className="text-red-700">{row.original.absent}</span>,
  },
  {
    id: "late",
    header: "Late",
    meta: { align: "center" },
    cell: ({ row }) => <span className="text-amber-700">{row.original.late}</span>,
  },
  {
    id: "excused",
    header: "Excused",
    meta: { align: "center" },
    cell: ({ row }) => <span className="text-gray-700">{row.original.excused}</span>,
  },
  {
    id: "percent",
    header: "%",
    meta: { align: "center" },
    cell: ({ row }) => <span className="font-medium text-gray-900">{percent(row.original)}%</span>,
  },
];
