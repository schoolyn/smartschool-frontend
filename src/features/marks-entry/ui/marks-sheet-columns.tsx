import { FieldArrayWithId, UseFormReturn } from "react-hook-form";

import { DataTableColumn } from "@/shared/ui/data-table";
import { Badge, BadgeTone } from "@/shared/ui/kit/badge";
import { Checkbox } from "@/shared/ui/kit/checkbox";
import { Input } from "@/shared/ui/kit/input";
import { IExamSubject, IMarksSheetItem } from "@/entities/exam";
import { MarksSheetFormValues } from "../model/marks-entry.schema";

const STATUS_TONE: Record<string, BadgeTone> = {
  published: "green",
  verified: "gray",
  marks_entry: "yellow",
  scheduled: "yellow",
};

export type MarksRow = FieldArrayWithId<MarksSheetFormValues, "rows", "id">;

interface MarksColumnOptions {
  form: UseFormReturn<MarksSheetFormValues>;
  draftRows: MarksSheetFormValues["rows"];
  examSubject?: IExamSubject;
  marksByStudent: Record<string, IMarksSheetItem>;
  examPublished: boolean;
}

// each cell registers its input by row index, so the grid stays bound to the react-hook-form field array
export const marksSheetColumns = ({
  form,
  draftRows,
  examSubject,
  marksByStudent,
  examPublished,
}: MarksColumnOptions): DataTableColumn<MarksRow>[] => [
  {
    id: "student",
    header: "Student",
    cell: ({ row }) => {
      const item = marksByStudent[row.original.studentId];
      return (
        <span className="font-medium text-gray-900">
          {item?.student.name} <span className="text-xs text-gray-400">#{item?.student.rollNumber}</span>
        </span>
      );
    },
  },
  {
    id: "theory",
    header: examSubject ? `Theory (max ${examSubject.maxMarks})` : "Theory",
    meta: { align: "center" },
    cell: ({ row }) => (
      <Input
        type="number"
        min={0}
        max={examSubject?.maxMarks}
        disabled={draftRows[row.index]?.isAbsent || examPublished}
        className="w-20 text-center"
        {...form.register(`rows.${row.index}.theoryMarks`)}
      />
    ),
  },
  {
    id: "practical",
    header: examSubject?.hasPractical ? `Practical (max ${examSubject.practicalMaxMarks})` : "Practical",
    meta: { align: "center" },
    cell: ({ row }) => (
      <Input
        type="number"
        min={0}
        max={examSubject?.practicalMaxMarks}
        disabled={draftRows[row.index]?.isAbsent || examPublished || !examSubject?.hasPractical}
        placeholder={examSubject?.hasPractical ? "" : "-"}
        className="w-20 text-center"
        {...form.register(`rows.${row.index}.practicalMarks`)}
      />
    ),
  },
  {
    id: "absent",
    header: "Absent",
    meta: { align: "center" },
    cell: ({ row }) => <Checkbox disabled={examPublished} {...form.register(`rows.${row.index}.isAbsent`)} />,
  },
  {
    id: "status",
    header: "Status",
    meta: { align: "center" },
    cell: ({ row }) => {
      const marks = marksByStudent[row.original.studentId]?.marks;
      return marks ? <Badge tone={STATUS_TONE[marks.status] ?? "gray"}>{marks.status}</Badge> : "-";
    },
  },
];
