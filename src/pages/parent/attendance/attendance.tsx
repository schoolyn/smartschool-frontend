import DataTable from "@/shared/ui/data-table";
import CustomSelectDropdown from "@/shared/ui/custom-select";
import ErrorState from "@/shared/ui/error-state";
import MonthPicker from "@/shared/ui/month-picker";
import SectionHeader from "@/shared/ui/section-header";
import { Card } from "@/shared/ui/kit/card";
import { Label } from "@/shared/ui/kit/label";
import { SelectOption } from "@/shared/types";
import { attendanceColumns } from "./attendance-columns";
import useParentAttendanceController from "./attendance-controller";

const ParentAttendance = () => {
  const c = useParentAttendanceController();
  const childOptions = c.children.map((child): SelectOption => ({
    id: child.studentId.id,
    name: child.studentId.name,
  }));
  const tiles = [
    { label: "Attendance", value: c.percent === null ? "-" : `${c.percent}%` },
    { label: "Present", value: c.summary?.present ?? 0 },
    { label: "Absent", value: c.summary?.absent ?? 0 },
    { label: "Late", value: c.summary?.late ?? 0 },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <SectionHeader title="Attendance" description="Your child's attendance, day by day" />

      <div className="flex flex-wrap items-end gap-4">
        {childOptions.length > 1 && (
          <div className="w-64">
            <Label>Child</Label>
            <CustomSelectDropdown
              placeholder="Select child"
              options={childOptions}
              value={childOptions.find((option) => option.id === c.studentId) ?? null}
              onChange={(option) => c.setStudentId(String(option.id))}
            />
          </div>
        )}
        <div className="w-48">
          <Label>Month</Label>
          <MonthPicker value={c.month} max={c.maxMonth} onChange={c.setMonth} />
        </div>
      </div>

      {c.loadError ? (
        <ErrorState error={c.loadError} onRetry={c.retryLoad} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {tiles.map((tile) => (
              <Card key={tile.label} className="p-4">
                <p className="text-sm text-gray-500">{tile.label}</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{tile.value}</p>
              </Card>
            ))}
          </div>
          <DataTable
            columns={attendanceColumns}
            data={c.records}
            getRowId={(record) => record.id}
            isLoading={c.isLoading}
            itemLabel={{ one: "day", other: "days" }}
            empty={{ title: "No attendance this month", description: "Days the class teacher marks show up here." }}
          />
        </>
      )}
    </div>
  );
};

export default ParentAttendance;
