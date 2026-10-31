import { DataTableColumn } from "@/shared/ui/data-table";
import RowMenu from "@/shared/ui/row-menu";
import { ITeacherAssignment } from "@/entities/academics";

export const ROLE_OPTIONS = [
  { id: "SUBJECT_TEACHER", name: "Subject teacher" },
  { id: "CLASS_TEACHER", name: "Class teacher" },
];
const ROLE_LABELS: Record<string, string> = Object.fromEntries(ROLE_OPTIONS.map((role) => [role.id, role.name]));

export const assignmentColumns = (
  remove: (item: ITeacherAssignment) => void
): DataTableColumn<ITeacherAssignment>[] => [
  {
    id: "teacher",
    header: "Teacher",
    cell: ({ row }) => <span className="font-medium text-gray-900">{row.original.teacherUserId?.name}</span>,
  },
  { id: "class", header: "Class", meta: { align: "center" }, cell: ({ row }) => row.original.classId?.name },
  { id: "section", header: "Section", meta: { align: "center" }, cell: ({ row }) => row.original.sectionId?.name },
  {
    id: "subject",
    header: "Subject",
    meta: { align: "center" },
    cell: ({ row }) => row.original.subjectId?.name || "-",
  },
  {
    id: "role",
    header: "Role",
    meta: { align: "center" },
    cell: ({ row }) => ROLE_LABELS[row.original.assignmentRole] ?? row.original.assignmentRole,
  },
  {
    id: "actions",
    header: "Actions",
    meta: { align: "center" },
    cell: ({ row }) => (
      <RowMenu items={[{ label: "Remove assignment", onSelect: () => remove(row.original), danger: true }]} />
    ),
  },
];
