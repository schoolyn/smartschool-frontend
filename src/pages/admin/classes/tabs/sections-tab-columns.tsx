import { DataTableColumn } from "@/shared/ui/data-table";
import RowMenu, { RowMenuItem } from "@/shared/ui/row-menu";
import StatusBadge from "@/shared/ui/status-badge";
import { ISection } from "@/entities/academics";

const seats = (section: ISection) => {
  const students = section.studentCount ?? 0;
  const full = !!section.capacity && students >= section.capacity;
  return (
    <>
      {students}
      {section.capacity ? ` / ${section.capacity}` : ""}
      {full && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">Full</span>}
    </>
  );
};

export const sectionColumns = (menuFor: (section: ISection) => RowMenuItem[]): DataTableColumn<ISection>[] => [
  {
    id: "name",
    header: "Section",
    cell: ({ row }) => <span className="font-medium text-gray-900">{row.original.name}</span>,
  },
  { id: "students", header: "Students", meta: { align: "center" }, cell: ({ row }) => seats(row.original) },
  { id: "room", header: "Room", meta: { align: "center" }, cell: ({ row }) => row.original.roomNumber || "-" },
  {
    id: "classTeacher",
    header: "Class teacher",
    meta: { align: "center" },
    cell: ({ row }) => row.original.classTeacherId?.name || "-",
  },
  {
    id: "status",
    header: "Status",
    meta: { align: "center" },
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "actions",
    header: "Actions",
    meta: { align: "center" },
    cell: ({ row }) => <RowMenu items={menuFor(row.original)} />,
  },
];
