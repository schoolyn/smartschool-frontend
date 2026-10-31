import { DataTableColumn } from "@/shared/ui/data-table";
import { Button } from "@/shared/ui/kit/button";
import { IFeeInstallmentBalance, IPayment } from "@/entities/fee";
import { formatMoney, paymentMethodLabel } from "@/shared/lib";

interface InstallmentColumnActions {
  canPayOnline: boolean;
  isBusy: boolean;
  isPaying: (label: string) => boolean;
  pay: (label: string) => void;
}

export const installmentColumns = ({
  canPayOnline,
  isBusy,
  isPaying,
  pay,
}: InstallmentColumnActions): DataTableColumn<IFeeInstallmentBalance>[] => [
  {
    id: "label",
    header: "Installment",
    cell: ({ row }) => <span className="font-medium text-gray-900">{row.original.label}</span>,
  },
  {
    id: "dueDate",
    header: "Due date",
    meta: { align: "center" },
    cell: ({ row }) => new Date(row.original.dueDate).toLocaleDateString(),
  },
  { id: "amount", header: "Amount", meta: { align: "center" }, cell: ({ row }) => formatMoney(row.original.netAmount) },
  { id: "paid", header: "Paid", meta: { align: "center" }, cell: ({ row }) => formatMoney(row.original.paidAmount) },
  {
    id: "balance",
    header: "Balance",
    meta: { align: "center" },
    cell: ({ row }) => {
      const { label, balance } = row.original;
      return (
        <span className={balance > 0 ? "text-red-600" : "text-green-600"}>
          {formatMoney(balance)}
          {canPayOnline && balance > 0 && (
            <Button
              variant="link"
              size="sm"
              className="ml-2"
              loading={isPaying(label)}
              disabled={isBusy}
              onClick={() => pay(label)}
            >
              Pay
            </Button>
          )}
        </span>
      );
    },
  },
];

interface PaymentColumnActions {
  isEmailing: boolean;
  download: (paymentId: string) => void;
  email: (paymentId: string) => void;
}

export const paymentColumns = ({ isEmailing, download, email }: PaymentColumnActions): DataTableColumn<IPayment>[] => [
  {
    id: "receipt",
    header: "Receipt",
    cell: ({ row }) => <span className="font-medium text-gray-900">{row.original.receiptNumber}</span>,
  },
  { id: "amount", header: "Amount", meta: { align: "center" }, cell: ({ row }) => formatMoney(row.original.amount) },
  {
    id: "method",
    header: "Method",
    meta: { align: "center" },
    cell: ({ row }) => paymentMethodLabel(row.original.method),
  },
  {
    id: "date",
    header: "Date",
    meta: { align: "center" },
    cell: ({ row }) => new Date(row.original.paidAt).toLocaleDateString(),
  },
  {
    id: "actions",
    header: "Actions",
    meta: { align: "center" },
    cell: ({ row }) => (
      <div className="flex gap-3 justify-center">
        <button
          type="button"
          onClick={() => download(row.original.id)}
          className="text-xs text-primary-600 hover:text-primary-800"
        >
          Download
        </button>
        <button
          type="button"
          onClick={() => email(row.original.id)}
          disabled={isEmailing}
          className="text-xs text-primary-600 hover:text-primary-800 disabled:opacity-50"
        >
          Email me
        </button>
      </div>
    ),
  },
];
