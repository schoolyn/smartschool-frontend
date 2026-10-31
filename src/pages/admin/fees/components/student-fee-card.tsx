import DataTable from "@/shared/ui/data-table";
import { SelectField, TextField } from "@/shared/ui/form-fields";
import { Badge } from "@/shared/ui/kit/badge";
import { Button } from "@/shared/ui/kit/button";
import { Card } from "@/shared/ui/kit/card";
import { Form } from "@/shared/ui/kit/form";
import { IStudentFeeSummary } from "@/entities/fee";
import { SelectOption } from "@/shared/types";
import { formatMoney } from "@/shared/lib";
import { concessionColumns, installmentColumns, paymentColumns } from "./student-fee-card-columns";
import useStudentFeeCardController from "./student-fee-card-controller";

const methodOptions: SelectOption[] = [
  { id: "cash", name: "Cash" },
  { id: "cheque", name: "Cheque" },
  { id: "bank_transfer", name: "Bank transfer" },
  { id: "upi", name: "UPI" },
  { id: "card", name: "Card" },
];

interface StudentFeeCardProps {
  organizationId: string;
  summary: IStudentFeeSummary;
  onReverse: (paymentId: string) => void;
}

// one assigned fee record: balances, the payment and concession forms, and its history
const StudentFeeCard = ({ organizationId, summary, onReverse }: StudentFeeCardProps) => {
  const c = useStudentFeeCardController(organizationId, summary);
  const { paymentForm, concessionForm } = c;

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div>
          {summary.feeStructureName && <p className="text-sm text-gray-500">{summary.feeStructureName}</p>}
          <h3 className="text-base font-medium text-gray-900">
            Balance: {formatMoney(summary.totalBalance)} of {formatMoney(summary.totalNet)}
          </h3>
        </div>
        <Badge tone={summary.totalBalance > 0 ? "red" : "green"}>
          {summary.totalBalance > 0 ? "Due" : "Fully paid"}
        </Badge>
      </div>

      <DataTable
        columns={installmentColumns}
        data={summary.installments}
        getRowId={(row) => row.label}
        empty={{ title: "No installments" }}
      />

      {c.canCollect && (
        <div className="mt-4 rounded-md bg-gray-50 p-4">
          <p className="mb-2 text-sm font-medium text-gray-700">Record a payment</p>
          <Form {...paymentForm}>
            <form onSubmit={c.onRecordPayment} noValidate className="grid grid-cols-1 items-start gap-3 sm:grid-cols-4">
              <TextField form={paymentForm} name="amount" label="Amount (₹)" type="number" min={0} step="0.01" />
              <SelectField form={paymentForm} name="method" label="Method" options={methodOptions} />
              <TextField form={paymentForm} name="instrumentRef" label="Reference" placeholder="Cheque no. / UTR" />
              <Button type="submit" className="sm:mt-6" loading={c.isRecording}>
                Record
              </Button>
            </form>
          </Form>
        </div>
      )}

      {c.canConcede && (
        <div className="mt-4 rounded-md bg-gray-50 p-4">
          <p className="mb-2 text-sm font-medium text-gray-700">Grant a concession</p>
          <Form {...concessionForm}>
            <form
              onSubmit={c.onGrantConcession}
              noValidate
              className="grid grid-cols-1 items-start gap-3 sm:grid-cols-4"
            >
              <TextField form={concessionForm} name="amount" label="Amount (₹)" type="number" min={0} step="0.01" />
              <TextField form={concessionForm} name="reason" label="Reason" />
              <SelectField
                form={concessionForm}
                name="installmentLabel"
                label="Apply to"
                options={c.installmentOptions}
              />
              <Button type="submit" className="sm:mt-6" loading={c.isGranting}>
                Grant
              </Button>
            </form>
          </Form>
        </div>
      )}

      {!!summary.concessions?.length && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-gray-700">Concessions granted</p>
          <DataTable
            columns={concessionColumns}
            data={summary.concessions}
            getRowId={(concession) => concession.id}
            empty={{ title: "No concessions" }}
          />
        </div>
      )}

      {summary.payments.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-gray-700">Payment history</p>
          <DataTable
            columns={paymentColumns({
              canReverse: c.canReverse,
              reverse: onReverse,
              download: c.downloadReceipt,
              downloadingId: c.downloadingId,
            })}
            data={summary.payments}
            getRowId={(payment) => payment.id}
            empty={{ title: "No payments" }}
          />
        </div>
      )}
    </Card>
  );
};

export default StudentFeeCard;
