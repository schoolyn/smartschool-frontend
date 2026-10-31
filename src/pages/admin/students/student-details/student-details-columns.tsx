import { DataTableColumn } from "@/shared/ui/data-table";
import { Badge } from "@/shared/ui/kit/badge";
import { IAttendanceRecord } from "@/entities/attendance";
import { IResult } from "@/entities/exam";

const examOf = (result: IResult) => (typeof result.examId === "object" ? result.examId : null);

export const examResultColumns: DataTableColumn<IResult>[] = [
  {
    id: "exam",
    header: "Exam",
    cell: ({ row }) => <span className="font-medium text-gray-900">{examOf(row.original)?.name || "-"}</span>,
  },
  {
    id: "date",
    header: "Date",
    meta: { className: "text-gray-500" },
    cell: ({ row }) => {
      const exam = examOf(row.original);
      return exam?.startDate ? new Date(exam.startDate).toLocaleDateString() : "-";
    },
  },
  {
    id: "result",
    header: "Result",
    cell: ({ row }) => {
      const status = row.original.promotionStatus;
      return (
        <Badge tone={status === "pass" ? "green" : status === "fail" ? "red" : "gray"} className="capitalize">
          {status}
        </Badge>
      );
    },
  },
  {
    id: "marks",
    header: "Marks",
    meta: { className: "text-gray-500" },
    cell: ({ row }) => `${row.original.totals.obtained} / ${row.original.totals.max}`,
  },
  {
    id: "percentage",
    header: "Percentage",
    meta: { className: "text-gray-500" },
    cell: ({ row }) => `${row.original.totals.percentage}%`,
  },
  { id: "grade", header: "Grade", meta: { className: "text-gray-500" }, cell: ({ row }) => row.original.grade || "-" },
];

export const attendanceRecordColumns: DataTableColumn<IAttendanceRecord>[] = [
  {
    id: "date",
    header: "Date",
    cell: ({ row }) => (
      <span className="text-gray-900">
        {row.original.date ? new Date(row.original.date).toLocaleDateString() : "-"}
      </span>
    ),
  },
  { id: "status", header: "Status", cell: ({ row }) => <span className="capitalize">{row.original.status}</span> },
  {
    id: "reason",
    header: "Reason",
    meta: { className: "text-gray-500" },
    cell: ({ row }) => row.original.reason || "-",
  },
];
