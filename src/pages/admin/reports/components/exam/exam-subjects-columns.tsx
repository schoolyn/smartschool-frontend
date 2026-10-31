import { DataTableColumn } from "@/shared/ui/data-table";
import RowMenu from "@/shared/ui/row-menu";
import { Button } from "@/shared/ui/kit/button";
import { IExamOverviewSubject } from "@/entities/exam";
import MarksProgress from "./marks-progress";

interface ExamSubjectActions {
  isPublished: boolean;
  enterMarks: (subject: IExamOverviewSubject) => void;
  edit: (subject: IExamOverviewSubject) => void;
  remove: (subject: IExamOverviewSubject) => void;
}

const nameOf = (subject: IExamOverviewSubject) => (typeof subject.subjectId === "object" ? subject.subjectId : null);

export const examSubjectsColumns = ({
  isPublished,
  enterMarks,
  edit,
  remove,
}: ExamSubjectActions): DataTableColumn<IExamOverviewSubject>[] => [
  {
    id: "subject",
    header: "Subject",
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-gray-900">{nameOf(row.original)?.name}</p>
        <p className="text-xs text-gray-500">{nameOf(row.original)?.code}</p>
      </div>
    ),
  },
  {
    id: "marks",
    meta: { align: "center" },
    header: "Max / Pass",
    cell: ({ row }) => (
      <div className="text-sm text-gray-700">
        <p>
          {row.original.maxMarks} / {row.original.passMarks}
        </p>
        {row.original.hasPractical && (
          <p className="text-xs text-gray-500">+ practical {row.original.practicalMaxMarks}</p>
        )}
      </div>
    ),
  },
  {
    id: "progress",
    meta: { align: "center" },
    header: "Marks",
    cell: ({ row }) => (
      <MarksProgress entered={row.original.entered} verified={row.original.verified} expected={row.original.expected} />
    ),
  },
  {
    id: "actions",
    header: "",
    meta: { align: "right" },
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        <Button variant="secondary" size="sm" onClick={() => enterMarks(row.original)}>
          {isPublished ? "View marks" : "Enter marks"}
        </Button>
        {!isPublished && (
          <RowMenu
            label={`Actions for ${nameOf(row.original)?.name ?? "subject"}`}
            items={[
              { label: "Edit marks", onSelect: () => edit(row.original) },
              ...(row.original.entered
                ? []
                : [{ label: "Remove", onSelect: () => remove(row.original), danger: true }]),
            ]}
          />
        )}
      </div>
    ),
  },
];
