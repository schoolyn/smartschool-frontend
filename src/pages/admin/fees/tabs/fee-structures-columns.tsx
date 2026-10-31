import { DataTableColumn } from "@/shared/ui/data-table";
import RowMenu from "@/shared/ui/row-menu";
import { Button } from "@/shared/ui/kit/button";
import { IFeeStructure } from "@/entities/fee";
import { formatMoney } from "@/shared/lib";

interface FeeStructureColumnActions {
  assigningId: string | null | undefined;
  assign: (feeStructureId: string) => void;
  edit: (structure: IFeeStructure) => void;
}

export const feeStructureColumns = ({
  assigningId,
  assign,
  edit,
}: FeeStructureColumnActions): DataTableColumn<IFeeStructure>[] => [
  {
    id: "name",
    header: "Name",
    cell: ({ row }) => <span className="font-medium text-gray-900">{row.original.name}</span>,
  },
  {
    id: "classes",
    header: "Classes",
    meta: { align: "center" },
    cell: ({ row }) => row.original.classIds.map((klass) => klass.name).join(", "),
  },
  {
    id: "total",
    header: "Total",
    meta: { align: "center" },
    cell: ({ row }) => formatMoney(row.original.items.reduce((sum, item) => sum + item.amount, 0)),
  },
  {
    id: "installments",
    header: "Installments",
    meta: { align: "center" },
    cell: ({ row }) => row.original.installments.length,
  },
  {
    id: "unassigned",
    header: "Not yet billed",
    meta: { align: "center" },
    cell: ({ row }) =>
      row.original.unassignedCount ? (
        <Button
          variant="link"
          loading={assigningId === row.original.id}
          disabled={!!assigningId}
          onClick={() => assign(row.original.id)}
        >
          Assign to {row.original.unassignedCount} student(s)
        </Button>
      ) : (
        <span className="text-sm text-gray-500">Everyone billed</span>
      ),
  },
  {
    id: "actions",
    header: "Action",
    meta: { align: "center" },
    cell: ({ row }) => <RowMenu items={[{ label: "Edit", onSelect: () => edit(row.original) }]} />,
  },
];
