import { DataTableColumn } from "@/shared/ui/data-table";
import RowMenu from "@/shared/ui/row-menu";
import { IFeeHead } from "@/entities/fee";

interface FeeHeadColumnActions {
  edit: (head: IFeeHead) => void;
  remove: (head: IFeeHead) => void;
}

export const feeHeadColumns = ({ edit, remove }: FeeHeadColumnActions): DataTableColumn<IFeeHead>[] => [
  {
    id: "name",
    header: "Name",
    cell: ({ row }) => <span className="font-medium text-gray-900">{row.original.name}</span>,
  },
  { id: "code", header: "Code", meta: { align: "center" }, cell: ({ row }) => row.original.code },
  {
    id: "category",
    header: "Category",
    meta: { align: "center", className: "capitalize" },
    cell: ({ row }) => row.original.category,
  },
  {
    id: "refundable",
    header: "Refundable",
    meta: { align: "center" },
    cell: ({ row }) => (row.original.isRefundable ? "Yes" : "No"),
  },
  {
    id: "actions",
    header: "Actions",
    meta: { align: "center" },
    cell: ({ row }) => (
      <RowMenu
        items={[
          { label: "Edit", onSelect: () => edit(row.original) },
          { label: "Remove", onSelect: () => remove(row.original), danger: true },
        ]}
      />
    ),
  },
];
