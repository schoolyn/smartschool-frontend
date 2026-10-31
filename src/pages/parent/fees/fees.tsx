import DataTable from "@/shared/ui/data-table";
import EmptyState from "@/shared/ui/empty-state";
import ErrorState from "@/shared/ui/error-state";
import PageLoader from "@/shared/ui/page-loader";
import SectionHeader from "@/shared/ui/section-header";
import { Button } from "@/shared/ui/kit/button";
import { formatMoney } from "@/shared/lib";
import { installmentColumns, paymentColumns } from "./fees-columns";
import useParentFeesController from "./fees-controller";

const ParentFees = () => {
  const c = useParentFeesController();
  const receiptColumns = paymentColumns({
    isEmailing: c.isEmailing,
    download: c.downloadReceipt,
    email: c.emailReceipt,
  });

  return (
    <div className="max-w-7xl mx-auto">
      <SectionHeader title="Fees" description="View dues, installments and payment history for your children" />
      {c.loadError ? (
        <ErrorState error={c.loadError} onRetry={c.retryLoad} />
      ) : c.isLoading ? (
        <PageLoader />
      ) : c.fees.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6">
          <EmptyState title="No fees yet" description="Fees the school assigns to your children will show up here." />
        </div>
      ) : (
        <div className="space-y-6">
          {c.fees.map((fee) => {
            const payments = fee.payments.filter((p) => p.entryType === "payment");
            return (
              <div key={fee.studentFeeId} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{fee.studentName}</h2>
                    {fee.feeStructureName && <p className="text-sm text-gray-500">{fee.feeStructureName}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        fee.totalBalance > 0 ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                      }`}
                    >
                      {fee.totalBalance > 0 ? `Due: ${formatMoney(fee.totalBalance)}` : "Fully paid"}
                    </span>
                    {c.canPayOnline && fee.totalBalance > 0 && (
                      <Button
                        size="sm"
                        loading={c.isPaying(fee.studentFeeId)}
                        disabled={!!c.paying}
                        onClick={() => c.payOnline(fee.studentFeeId)}
                      >
                        Pay {formatMoney(fee.totalBalance)} now
                      </Button>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <DataTable
                    columns={installmentColumns({
                      canPayOnline: c.canPayOnline,
                      isBusy: !!c.paying,
                      isPaying: (label) => c.isPaying(fee.studentFeeId, label),
                      pay: (label) => c.payOnline(fee.studentFeeId, [label]),
                    })}
                    data={fee.installments}
                    getRowId={(row) => row.label}
                    empty={{ title: "No installments" }}
                  />
                </div>

                {payments.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Payment history</p>
                    <DataTable
                      columns={receiptColumns}
                      data={payments}
                      getRowId={(p) => p.id}
                      empty={{ title: "No payments yet" }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ParentFees;
