import type { ReactNode } from "react";
import { ClipboardDocumentCheckIcon, DocumentChartBarIcon, TableCellsIcon } from "@heroicons/react/24/outline";

import CustomSelectDropdown from "@/shared/ui/custom-select";
import DataTable from "@/shared/ui/data-table";
import DatePicker from "@/shared/ui/date-picker";
import EmptyState from "@/shared/ui/empty-state";
import MonthPicker from "@/shared/ui/month-picker";
import PageTabs, { PageTab } from "@/shared/ui/page-tabs";
import SectionHeader from "@/shared/ui/section-header";
import { Label } from "@/shared/ui/kit/label";
import { SelectOption } from "@/shared/types";
import { formatDate } from "@/shared/lib";
import { reportColumns, rosterColumns } from "./attendance-columns";
import RegisterStatus from "./components/register-status";
import useAttendanceController, { AttendanceTabKey } from "./attendance-controller";
import MonthlyRegister from "./components/monthly-register";

// each tab brings its own date field for the shared filter row
type AttendanceTab = PageTab<AttendanceTabKey> & { dateField: () => ReactNode };

const AdminAttendance = () => {
  const c = useAttendanceController();
  const yearOptions = c.academicYears.map((y): SelectOption => ({ id: y.id, name: y.name }));
  const classOptions = c.classes.map((k): SelectOption => ({ id: k.id, name: k.name }));
  const sectionOptions = c.sections.map((s): SelectOption => ({ id: s.id, name: s.name }));
  const sectionLabel =
    `${c.classes.find((k) => k.id === c.classId)?.name ?? ""} ${c.sections.find((s) => s.id === c.sectionId)?.name ?? ""}`.trim();

  const TABS: AttendanceTab[] = [
    {
      key: "mark",
      label: "Mark Attendance",
      icon: ClipboardDocumentCheckIcon,
      dateField: () => (
        <div>
          <Label>Date</Label>
          <DatePicker clearable={false} value={c.date} max={c.maxDate} onChange={c.setDate} />
        </div>
      ),
      render: () =>
        c.sectionId && (
          <div className="space-y-6">
            {c.holidayTitle && (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {formatDate(`${c.date}T00:00:00`)} is a holiday on the school calendar ({c.holidayTitle}). Only save
                attendance if the school is open that day.
              </p>
            )}
            <DataTable
              columns={rosterColumns(c)}
              data={c.visibleStudents}
              getRowId={(student) => student.id}
              isLoading={c.isLoadingRoster}
              search={{ placeholder: "Search students", value: c.rosterSearch, onChange: c.setRosterSearch }}
              toolbar={
                c.students.length > 0 && <RegisterStatus counts={c.counts} isDirty={c.isDirty} isMarked={c.isMarked} />
              }
              actions={[
                { label: "Mark all present", onClick: () => c.markAll("present"), menu: true },
                { label: "Mark all absent", onClick: () => c.markAll("absent"), menu: true },
                { label: "Export CSV", readOnlySafe: true, onClick: c.exportRoster, menu: true },
                { label: "Save attendance", onClick: c.submit, loading: c.isSaving, variant: "primary" as const },
              ].map((action) => ({ ...action, hidden: c.students.length === 0 }))}
              empty={
                c.rosterSearch
                  ? { title: "No matching students", description: `No student matches "${c.rosterSearch}".` }
                  : {
                      title: "No students in this section",
                      description: "Students enrolled in this section appear here to be marked.",
                    }
              }
            />
          </div>
        ),
    },
    {
      key: "report",
      label: "Attendance Report",
      icon: DocumentChartBarIcon,
      dateField: () => (
        <div className="flex min-w-0 gap-2">
          <div className="min-w-0 flex-1">
            <Label>From</Label>
            <DatePicker clearable={false} max={c.maxDate} value={c.reportFrom} onChange={c.setReportFrom} />
          </div>
          <div className="min-w-0 flex-1">
            <Label>To</Label>
            <DatePicker
              clearable={false}
              min={c.reportFrom}
              max={c.maxDate}
              value={c.reportTo}
              onChange={c.setReportTo}
            />
          </div>
        </div>
      ),
      render: () =>
        c.sectionId && (
          <div className="space-y-3">
            <h2 className="text-lg font-medium text-gray-900">
              Attendance from {formatDate(`${c.reportFrom}T00:00:00`)} to {formatDate(`${c.reportTo}T00:00:00`)}
              <span className="text-sm text-gray-500 font-normal"> - {c.reportTotalSessions} day(s) marked</span>
            </h2>
            <DataTable
              columns={reportColumns}
              data={c.reportRows}
              getRowId={(row) => row.studentId}
              isLoading={c.isLoadingReport}
              itemLabel={{ one: "student", other: "students" }}
              pagination={{ pageSize: 20 }}
              actions={[
                { label: "Export CSV", readOnlySafe: true, onClick: c.exportReport, hidden: c.reportRows.length === 0 },
              ]}
              empty={{
                title: "No attendance in this range",
                description: "Nothing was marked for this section between these dates.",
              }}
            />
          </div>
        ),
    },
    {
      key: "register",
      label: "Monthly Register",
      icon: TableCellsIcon,
      dateField: () => (
        <div>
          <Label>Month</Label>
          <MonthPicker value={c.registerMonth} max={c.maxDate.slice(0, 7)} onChange={c.setRegisterMonth} />
        </div>
      ),
      render: () =>
        c.sectionId && (
          <MonthlyRegister
            organizationId={c.organizationId}
            sectionId={c.sectionId}
            month={c.registerMonth}
            sectionLabel={sectionLabel}
          />
        ),
    },
  ];
  const activeTab = TABS.find((tab) => tab.key === c.activeTab);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <SectionHeader
        title="Attendance"
        description="Mark daily attendance, review it over a date range, or see a month day by day"
      />

      {c.hasNoClasses && (
        <p className="mb-4 rounded-lg bg-white p-4 text-sm text-gray-600 shadow">
          You are not assigned to any class yet. Ask your school admin to assign you to a section.
        </p>
      )}

      <PageTabs tabs={TABS} value={c.activeTab} onChange={c.setActiveTab} label="Attendance sections">
        <div className="bg-white shadow rounded-lg p-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <Label>Academic Year</Label>
              <CustomSelectDropdown
                placeholder="Select"
                options={yearOptions}
                value={yearOptions.find((option) => option.id === c.academicYearId) ?? null}
                onChange={(o) => c.setAcademicYearId(String(o.id))}
              />
            </div>
            <div>
              <Label>Class</Label>
              <CustomSelectDropdown
                placeholder="Select"
                disabled={!c.academicYearId}
                options={classOptions}
                value={classOptions.find((option) => option.id === c.classId) ?? null}
                onChange={(o) => c.setClassId(String(o.id))}
              />
            </div>
            <div>
              <Label>Section</Label>
              <CustomSelectDropdown
                placeholder="Select"
                disabled={!c.classId}
                options={sectionOptions}
                value={sectionOptions.find((option) => option.id === c.sectionId) ?? null}
                onChange={(o) => c.setSectionId(String(o.id))}
              />
            </div>
            {activeTab?.dateField()}
          </div>
        </div>

        {!c.sectionId && !c.hasNoClasses && (
          <div className="bg-white shadow rounded-lg">
            <EmptyState
              title={c.classes.length ? "Pick a class and section" : "No classes yet"}
              description={
                c.classes.length
                  ? "Choose a class and section above to mark or review attendance."
                  : "Add an academic year, classes and sections on the Classes page first."
              }
            />
          </div>
        )}
      </PageTabs>
    </div>
  );
};

export default AdminAttendance;
