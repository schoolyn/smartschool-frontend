import { DataTableColumn } from "@/shared/ui/data-table";
import RowMenu, { RowMenuItem } from "@/shared/ui/row-menu";
import StatusBadge from "@/shared/ui/status-badge";
import { ISubject } from "@/entities/academics";

export const TYPE_LABELS: Record<string, string> = {
  core: "Core",
  elective: "Elective",
  co_curricular: "Co-curricular",
};

export const subjectColumns = (menuFor: (subject: ISubject) => RowMenuItem[]): DataTableColumn<ISubject>[] => [
  {
    id: "name",
    header: "Subject",
    cell: ({ row }) => <span className="font-medium text-gray-900">{row.original.name}</span>,
  },
  { id: "code", header: "Code", meta: { align: "center" }, cell: ({ row }) => row.original.code },
  {
    id: "type",
    header: "Type",
    meta: { align: "center" },
    cell: ({ row }) => TYPE_LABELS[row.original.type] ?? row.original.type,
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
