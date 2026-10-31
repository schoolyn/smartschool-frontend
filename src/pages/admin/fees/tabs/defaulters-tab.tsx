import { AcademicFilter } from "@/features/academic-filter";
import DataTable, { DataTableColumn } from "@/shared/ui/data-table";
import DatePicker from "@/shared/ui/date-picker";
import ErrorState from "@/shared/ui/error-state";
import { ExportDialog } from "@/features/export-dialog";
import { Badge } from "@/shared/ui/kit/badge";
import { Card, CardTitle } from "@/shared/ui/kit/card";
import { IFeeDefaulter } from "@/entities/fee";
import { formatMoney } from "@/shared/lib";
import useDefaultersController from "./defaulters-controller";

const formatDay = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));

const SummaryTile = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
    <p className="mt-1 text-xl font-semibold text-gray-900">{value}</p>
  </div>
);

const columns: DataTableColumn<IFeeDefaulter>[] = [
  {
    id: "student",
    header: "Student",
    cell: ({ row }) => (
      <>
        <p className="font-medium text-gray-900">{row.original.student?.name}</p>
        {row.original.student?.admissionNumber && (
          <p className="text-xs text-gray-500">{row.original.student.admissionNumber}</p>
        )}
      </>
    ),
  },
  {
    id: "class",
    header: "Class",
    meta: { align: "center" },
    cell: ({ row }) =>
      row.original.student ? `${row.original.student.className} ${row.original.student.sectionName}` : "",
  },
  {
    id: "overdue",
    header: "Overdue",
    meta: { align: "center" },
    cell: ({ row }) => (
      <>
        <p className="font-medium text-red-700">{formatMoney(row.original.overdueAmount)}</p>
        <p className="text-xs text-gray-500">{row.original.overdueInstallments.map((i) => i.label).join(", ")}</p>
      </>
    ),
  },
  {
    id: "outstanding",
    header: "Outstanding",
    meta: { align: "center" },
    cell: ({ row }) => formatMoney(row.original.outstandingAmount),
  },
  {
    id: "oldestDue",
    header: "Oldest due",
    meta: { align: "center" },
    cell: ({ row }) => (
      <>
        <p>{formatDay(row.original.oldestDueDate)}</p>
        <Badge tone={row.original.daysOverdue > 30 ? "red" : "yellow"}>{row.original.daysOverdue} days</Badge>
      </>
    ),
  },
  {
    id: "guardian",
    header: "Guardian",
    meta: { align: "center" },
    cell: ({ row }) => {
      const guardian = row.original.student?.guardian;
      if (!guardian) return <span className="text-gray-400">No guardian</span>;
      return (
        <>
          <p>{guardian.name}</p>
          {guardian.phoneNumber && (
            <a href={`tel:${guardian.phoneNumber}`} className="text-xs text-primary-600 underline">
              {guardian.phoneNumber}
            </a>
          )}
        </>
      );
    },
  },
];

// students with an instalment past its due date and still unpaid, most overdue first
const DefaultersTab = ({ organizationId }: { organizationId: string }) => {
  const c = useDefaultersController(organizationId);

  return (
    <div className="space-y-4">
      <Card>
        <CardTitle className="mb-4 font-medium">Fee Defaulters</CardTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <AcademicFilter organizationId={organizationId} value={c.scope} onChange={c.onScopeChange} />
          <DatePicker clearable={false} label="Overdue as of" value={c.asOf} onChange={c.onAsOfChange} />
        </div>
      </Card>

      {c.summary && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SummaryTile label="Students overdue" value={String(c.summary.students)} />
          <SummaryTile label="Overdue" value={formatMoney(c.summary.overdueAmount)} />
          <SummaryTile label="Total outstanding" value={formatMoney(c.summary.outstandingAmount)} />
        </div>
      )}

      {c.isError ? (
        <ErrorState error={c.error} onRetry={c.retry} />
      ) : (
        <DataTable
          columns={columns}
          data={c.rows}
          getRowId={(row) => row.studentId}
          isLoading={c.isLoading}
          pagination={c.pagination}
          itemLabel={{ one: "defaulter", other: "defaulters" }}
          actions={[
            { label: "Export CSV", readOnlySafe: true, onClick: c.openExport, disabled: c.pagination.total === 0 },
          ]}
          empty={{ title: "No overdue fees", description: "Every instalment due by this date has been paid." }}
        />
      )}

      <ExportDialog {...c.exportDialog} />
    </div>
  );
};

export default DefaultersTab;
