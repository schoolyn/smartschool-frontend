import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

import PageLoader from "@/components/page-loader";
import NoRecordFound from "@/components/no-record-found";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/table";
import SectionHeader from "@/components/section-header";
import { downloadFeeReceipt, useEmailFeeReceipt } from "@/pages/admin/fees/service/fees-service";
import useParentFeesController from "./fees-controller";

const formatMoney = (paise: number) => `${(paise / 100).toFixed(2)}`;

const ParentFees = () => {
  const { t, fees, isLoading } = useParentFeesController();
  const { organizationId } = useParams();
  const emailFeeReceipt = useEmailFeeReceipt(organizationId || "");

  const handleDownload = async (paymentId: string) => {
    try {
      await downloadFeeReceipt(organizationId || "", paymentId);
    } catch {
      toast.error("Could not download the receipt. Please try again.");
    }
  };

  const handleEmail = (paymentId: string) => {
    emailFeeReceipt.mutate(paymentId, {
      onSuccess: () => toast.success("Receipt emailed to your registered email address."),
      onError: () => toast.error("Could not email the receipt. Please try again."),
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <SectionHeader title="Fees" description="View dues, installments and payment history for your children" />
      {isLoading ? (
        <PageLoader />
      ) : fees.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6">
          <NoRecordFound t={t} searchTerm="" clearFilters={() => {}} />
        </div>
      ) : (
        <div className="space-y-6">
          {fees.map((fee) => (
            <div key={fee.studentFeeId} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{fee.studentName}</h2>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    fee.totalBalance > 0 ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                  }`}
                >
                  {fee.totalBalance > 0 ? `Due: ${formatMoney(fee.totalBalance)}` : "Fully paid"}
                </span>
              </div>

              <div className="mb-4">
                <Table>
                  <TableHeader>
                    <TableHead>Installment</TableHead>
                    <TableHead className="text-center">Due date</TableHead>
                    <TableHead className="text-center">Amount</TableHead>
                    <TableHead className="text-center">Paid</TableHead>
                    <TableHead className="text-center">Balance</TableHead>
                  </TableHeader>
                  <TableBody>
                    {fee.installments.map((i) => (
                      <TableRow key={i.label}>
                        <TableCell className="font-medium text-gray-900">{i.label}</TableCell>
                        <TableCell className="text-center">{new Date(i.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell className="text-center">{formatMoney(i.netAmount)}</TableCell>
                        <TableCell className="text-center">{formatMoney(i.paidAmount)}</TableCell>
                        <TableCell className={`text-center ${i.balance > 0 ? "text-red-600" : "text-green-600"}`}>
                          {formatMoney(i.balance)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {fee.payments.filter((p) => p.entryType === "payment").length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Payment history</p>
                  <Table>
                    <TableHeader>
                      <TableHead>Receipt</TableHead>
                      <TableHead className="text-center">Amount</TableHead>
                      <TableHead className="text-center">Method</TableHead>
                      <TableHead className="text-center">Date</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableHeader>
                    <TableBody>
                      {fee.payments
                        .filter((p) => p.entryType === "payment")
                        .map((p) => (
                          <TableRow key={p.id}>
                            <TableCell className="font-medium text-gray-900">{p.receiptNumber}</TableCell>
                            <TableCell className="text-center">{formatMoney(p.amount)}</TableCell>
                            <TableCell className="text-center capitalize">{p.method.replace("_", " ")}</TableCell>
                            <TableCell className="text-center">{new Date(p.paidAt).toLocaleDateString()}</TableCell>
                            <TableCell className="text-center">
                              <div className="flex gap-3 justify-center">
                                <button
                                  type="button"
                                  onClick={() => handleDownload(p.id)}
                                  className="text-xs text-primary-600 hover:text-primary-800"
                                >
                                  Download
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleEmail(p.id)}
                                  disabled={emailFeeReceipt.isPending}
                                  className="text-xs text-primary-600 hover:text-primary-800 disabled:opacity-50"
                                >
                                  Email me
                                </button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParentFees;
