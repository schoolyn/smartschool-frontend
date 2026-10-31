import { DataTableColumn } from "@/shared/ui/data-table";
import RowMenu from "@/shared/ui/row-menu";
import { Badge } from "@/shared/ui/kit/badge";
import { IExam } from "@/entities/exam";
import { dateRange, examTypeLabel, stageOf } from "../../exam-ui";
import MarksProgress from "./marks-progress";

interface ExamListActions {
  edit: (exam: IExam) => void;
  remove: (exam: IExam) => void;
}

export const examListColumns = ({ edit, remove }: ExamListActions): DataTableColumn<IExam>[] => [
  {
    id: "exam",
    header: "Exam",
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-gray-900">{row.original.name}</p>
        <p className="text-xs text-gray-500">
          {[examTypeLabel(row.original.type), row.original.term].filter(Boolean).join(" · ")}
        </p>
      </div>
    ),
  },
  {
    id: "dates",
    meta: { align: "center" },
    header: "Dates",
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm text-gray-700">
        {dateRange(row.original.startDate, row.original.endDate)}
      </span>
    ),
  },
  {
    id: "classes",
    meta: { align: "center" },
    header: "Classes",
    cell: ({ row }) => (
      <span className="text-sm text-gray-700">{row.original.classIds.map((klass) => klass.name).join(", ")}</span>
    ),
  },
  {
    id: "progress",
    meta: { align: "center" },
    header: "Marks",
    cell: ({ row }) => {
      const progress = row.original.progress;
      if (!progress || progress.stage === "setup") {
        return (
          <span className="text-xs text-gray-500">
            Subjects set for {progress?.classesWithSubjects ?? 0} of {progress?.classes ?? 0} classes
          </span>
        );
      }
      return <MarksProgress entered={progress.entered} verified={progress.verified} expected={progress.expected} />;
    },
  },
  {
    id: "status",
    meta: { align: "center" },
    header: "Status",
    cell: ({ row }) => {
      const stage = stageOf(row.original.progress?.stage);
      return <Badge tone={stage.tone}>{stage.label}</Badge>;
    },
  },
  {
    id: "actions",
    header: "",
    meta: { align: "right" },
    cell: ({ row }) => {
      const exam = row.original;
      if (exam.progress?.stage === "published") return null;
      return (
        // clicks inside the menu must not open the exam
        <div onClick={(event) => event.stopPropagation()}>
          <RowMenu
            label={`Actions for ${exam.name}`}
            items={[
              { label: "Edit details", onSelect: () => edit(exam) },
              ...(exam.progress?.entered ? [] : [{ label: "Delete exam", onSelect: () => remove(exam), danger: true }]),
            ]}
          />
        </div>
      );
    },
  },
];
