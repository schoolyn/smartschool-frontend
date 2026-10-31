import DataTable from "@/shared/ui/data-table";
import ErrorState from "@/shared/ui/error-state";
import { Checkbox } from "@/shared/ui/kit/checkbox";
import { registerColumns } from "./monthly-register-columns";
import useMonthlyRegisterController from "./monthly-register-controller";

interface MonthlyRegisterProps {
  organizationId: string;
  sectionId: string;
  month: string;
  sectionLabel: string;
}

const MonthlyRegister = ({ organizationId, sectionId, month, sectionLabel }: MonthlyRegisterProps) => {
  const c = useMonthlyRegisterController(organizationId, sectionId, month, sectionLabel);
  if (c.error) return <ErrorState error={c.error} onRetry={c.retry} />;

  return (
    <div className="space-y-2">
      <DataTable
        columns={registerColumns(c.days)}
        data={c.rows}
        getRowId={(row) => row.studentId}
        isLoading={c.isLoading}
        search={{ placeholder: "Search students", value: c.search, onChange: c.setSearch }}
        toolbar={
          <>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <Checkbox checked={c.showHolidays} onChange={(event) => c.setShowHolidays(event.target.checked)} />
              Show holidays
            </label>
            {c.schoolDays !== undefined && (
              <span className="text-sm text-gray-500">{c.schoolDays} school day(s) so far</span>
            )}
          </>
        }
        actions={[{ label: "Export CSV", readOnlySafe: true, onClick: c.exportCsv, disabled: !c.rows.length }]}
        empty={
          c.search
            ? { title: "No matching students", description: `No student matches "${c.search}".` }
            : {
                title: "No students in this section",
                description: "Students enrolled in this section appear here with their month.",
              }
        }
      />
      <p className="px-1 text-xs text-gray-500">
        P present · A absent · L late · E excused · red columns are holidays from the school calendar. Late and excused
        count as attended.
      </p>
    </div>
  );
};

export default MonthlyRegister;
