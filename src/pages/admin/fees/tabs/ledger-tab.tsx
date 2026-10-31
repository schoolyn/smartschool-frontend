import DataTable, { DataTableColumn } from "@/shared/ui/data-table";
import ErrorState from "@/shared/ui/error-state";
import { ExportDialog } from "@/features/export-dialog";
import { Badge } from "@/shared/ui/kit/badge";
import { Button } from "@/shared/ui/kit/button";
import { Card, CardTitle } from "@/shared/ui/kit/card";
import { IPayment } from "@/entities/fee";
import { formatMoney, paymentMethodLabel } from "@/shared/lib";
import { IOnlinePaymentForReview } from "@/entities/fee";
import useLedgerController from "./ledger-controller";

const reviewColumns: DataTableColumn<IOnlinePaymentForReview>[] = [
  {
    id: "student",
    header: "Student",
    cell: ({ row }) => <span className="font-medium text-gray-900">{row.original.studentId?.name ?? ""}</span>,
  },
  { id: "amount", header: "Amount", meta: { align: "center" }, cell: ({ row }) => formatMoney(row.original.amount) },
  {
    id: "gatewayPaymentId",
    header: "Razorpay payment",
    meta: { align: "center", className: "font-mono text-xs" },
    cell: ({ row }) => row.original.gatewayPaymentId,
  },
  {
    id: "date",
    header: "Date",
    meta: { align: "center" },
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
];

const ledgerColumns = (download: (paymentId: string) => void, downloadingId?: string): DataTableColumn<IPayment>[] => [
  { id: "receipt", header: "Receipt", cell: ({ row }) => row.original.receiptNumber },
  {
    id: "student",
    header: "Student",
    meta: { align: "center", className: "font-medium text-gray-900" },
    cell: ({ row }) => (typeof row.original.studentId === "object" ? row.original.studentId.name : ""),
  },
  {
    id: "type",
    header: "Type",
    meta: { align: "center" },
    cell: ({ row }) => (
      <Badge tone={row.original.entryType === "reversal" ? "red" : "green"}>
        {row.original.entryType === "reversal" ? "Reversal" : "Payment"}
      </Badge>
    ),
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
    header: "Action",
    meta: { align: "center" },
    cell: ({ row }) => (
      <Button variant="link" loading={downloadingId === row.original.id} onClick={() => download(row.original.id)}>
        Receipt
      </Button>
    ),
  },
];

const LedgerTab = ({ organizationId }: { organizationId: string }) => {
  const c = useLedgerController(organizationId);

  return (
    <div className="space-y-6">
      {c.toReview.length > 0 && (
        <Card className="border border-amber-200">
          <CardTitle className="font-medium">Online payments that need a look</CardTitle>
          <p className="mb-3 mt-1 text-sm text-gray-500">
            These were paid online but couldn&apos;t be applied, usually because the same fee was paid another way
            first. Record the amount on Student Fees &amp; Payments, or refund it from your Razorpay dashboard.
          </p>
          <DataTable
            columns={reviewColumns}
            data={c.toReview}
            getRowId={(item) => item._id}
            empty={{ title: "Nothing to review" }}
          />
        </Card>
      )}
      <div>
        <h3 className="mb-3 text-lg font-medium text-gray-900">Payment Ledger</h3>
        {c.error ? (
          <ErrorState error={c.error} onRetry={c.retry} />
        ) : (
          <DataTable
            columns={ledgerColumns(c.downloadReceipt, c.downloadingId)}
            data={c.payments}
            getRowId={(payment) => payment.id}
            isLoading={c.isLoading}
            pagination={c.pagination}
            itemLabel={{ one: "payment", other: "payments" }}
            actions={[
              { label: "Export CSV", readOnlySafe: true, onClick: c.openExport, disabled: c.pagination.total === 0 },
            ]}
            empty={{
              title: "No payments recorded yet",
              description: "Payments you record on Student Fees & Payments show up here, newest first.",
            }}
          />
        )}
      </div>

      <ExportDialog {...c.exportDialog} />
    </div>
  );
};

export default LedgerTab;
