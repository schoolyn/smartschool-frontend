import { DataTableColumn } from "@/shared/ui/data-table";
import RowMenu, { RowMenuItem } from "@/shared/ui/row-menu";
import StatusBadge from "@/shared/ui/status-badge";
import { IAcademicYear } from "@/entities/academics";

const formatDate = (value: string) => new Date(value).toLocaleDateString();

export const yearColumns = (menuFor: (year: IAcademicYear) => RowMenuItem[]): DataTableColumn<IAcademicYear>[] => [
  {
    id: "name",
    header: "Year",
    cell: ({ row }) => <span className="font-medium text-gray-900">{row.original.name}</span>,
  },
  {
    id: "startDate",
    header: "Starts",
    meta: { align: "center" },
    cell: ({ row }) => formatDate(row.original.startDate),
  },
  { id: "endDate", header: "Ends", meta: { align: "center" }, cell: ({ row }) => formatDate(row.original.endDate) },
  {
    id: "status",
    header: "Status",
    meta: { align: "center" },
    cell: ({ row }) => <StatusBadge status={row.original.isCurrent ? "current" : row.original.status} />,
  },
  {
    id: "actions",
    header: "Actions",
    meta: { align: "center" },
    cell: ({ row }) => <RowMenu items={menuFor(row.original)} />,
  },
];
