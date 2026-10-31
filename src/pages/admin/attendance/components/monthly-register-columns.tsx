import { DataTableColumn } from "@/shared/ui/data-table";
import { cn } from "@/shared/lib/utils";
import { AttendanceStatus } from "@/entities/attendance";
import { IMonthRegister, IMonthRegisterRow } from "@/entities/attendance";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const MARKS: Record<AttendanceStatus, { letter: string; className: string }> = {
  present: { letter: "P", className: "text-green-700" },
  absent: { letter: "A", className: "text-red-600" },
  late: { letter: "L", className: "text-amber-600" },
  excused: { letter: "E", className: "text-gray-500" },
};

export const SUMMARY_COLUMNS: { key: keyof IMonthRegisterRow["summary"]; label: string }[] = [
  { key: "present", label: "Present" },
  { key: "absent", label: "Absent" },
  { key: "late", label: "Late" },
  { key: "excused", label: "Excused" },
  { key: "holiday", label: "Holiday" },
  { key: "missing", label: "Missing" },
];

// the student and Att % columns stay pinned while the days scroll between them
export const registerColumns = (days: IMonthRegister["days"]): DataTableColumn<IMonthRegisterRow>[] => [
  {
    id: "student",
    header: "Student",
    meta: {
      className:
        "sticky left-0 z-10 min-w-[160px] border-r border-gray-200 bg-white px-3 shadow-[6px_0_6px_-6px_rgba(0,0,0,0.15)]",
    },
    cell: ({ row: { original: row } }) => (
      <>
        <p className="font-medium text-gray-900">{row.studentName}</p>
        {row.rollNumber && <p className="text-xs text-gray-400">Roll {row.rollNumber}</p>}
      </>
    ),
  },
  ...days.map((day): DataTableColumn<IMonthRegisterRow> => ({
    id: day.date,
    header: () => (
      <>
        <div className="text-gray-700">{Number(day.date.slice(8))}</div>
        <div className="text-[10px] font-normal">{WEEKDAYS[day.weekday]}</div>
      </>
    ),
    meta: {
      align: "center",
      className: cn("h-auto min-w-[30px] px-1 py-1.5 text-xs font-semibold", day.isHoliday && "bg-red-50 text-red-500"),
    },
    cell: ({ row: { original: row } }) => {
      const status = row.cells[day.date];
      return status ? (
        <span className={MARKS[status].className}>{MARKS[status].letter}</span>
      ) : (
        <span className="text-gray-300">-</span>
      );
    },
  })),
  ...SUMMARY_COLUMNS.map((column, index): DataTableColumn<IMonthRegisterRow> => ({
    id: column.key,
    header: column.label,
    meta: {
      align: "center",
      className: cn("px-2 font-medium text-gray-800", index === 0 && "border-l border-gray-200"),
    },
    cell: ({ row }) => row.original.summary[column.key],
  })),
  {
    id: "percent",
    header: "Att %",
    meta: {
      align: "center",
      className:
        "sticky right-0 z-10 border-l border-gray-200 bg-white px-3 font-semibold shadow-[-6px_0_6px_-6px_rgba(0,0,0,0.15)]",
    },
    cell: ({ row }) => (
      <span className={row.original.summary.percent < 75 ? "text-red-600" : "text-gray-900"}>
        {row.original.summary.percent}%
      </span>
    ),
  },
];
