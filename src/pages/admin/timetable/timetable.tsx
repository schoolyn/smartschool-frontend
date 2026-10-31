import { PlusIcon } from "@heroicons/react/20/solid";

import CustomSelectDropdown from "@/shared/ui/custom-select";
import DeleteConfirmationDialog from "@/shared/ui/delete-confirmation-dialog";
import ErrorState from "@/shared/ui/error-state";
import SectionHeader from "@/shared/ui/section-header";
import { SelectOption } from "@/shared/types";
import PeriodDialog from "./components/period-dialog";
import WeekGrid from "./components/week-grid";
import { DAY_NAMES, formatTime } from "./timetable.utils";
import useTimetableController from "./timetable-controller";
import EmptyState from "@/shared/ui/empty-state";

const Picker = ({
  label,
  options,
  value,
  disabled,
  onChange,
}: {
  label: string;
  options: SelectOption[];
  value: string;
  disabled?: boolean;
  onChange: (id: string) => void;
}) => (
  <div>
    <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
    <CustomSelectDropdown
      placeholder="Select"
      disabled={disabled}
      options={options}
      value={options.find((option) => option.id === value) ?? null}
      onChange={(option) => onChange(String(option.id))}
    />
  </div>
);

const Timetable = () => {
  const c = useTimetableController();
  const { picker, toRemove } = c;
  const { isTeacher, academicYearId, classId, sectionId } = picker;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <SectionHeader
        title={isTeacher ? "My Timetable" : "Timetable"}
        description={
          isTeacher
            ? "Your periods for the week, across every class you teach"
            : "Set up each section's periods for the week"
        }
        action={{
          label: "Add period",
          icon: PlusIcon,
          onClick: c.openAdd,
          disabled: !sectionId,
          title: !sectionId ? "Pick a class and section first" : undefined,
          hidden: isTeacher,
        }}
      />

      {!isTeacher && (
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Picker
              label="Academic Year"
              options={picker.academicYears.map((y) => ({ id: y.id, name: y.name }))}
              value={academicYearId}
              onChange={picker.setAcademicYearId}
            />
            <Picker
              label="Class"
              options={picker.classes.map((k) => ({ id: k.id, name: k.name }))}
              value={classId}
              disabled={!academicYearId}
              onChange={picker.setClassId}
            />
            <Picker
              label="Section"
              options={picker.sections.map((s) => ({ id: s.id, name: s.name }))}
              value={sectionId}
              disabled={!classId}
              onChange={picker.setSectionId}
            />
          </div>
        </div>
      )}

      {!c.ready ? (
        <div className="rounded-lg bg-white shadow">
          <EmptyState
            title={picker.classes.length ? "Pick a class and section" : "No classes yet"}
            description={
              picker.classes.length
                ? "Choose a class and section above to see and build its week."
                : "Add an academic year, classes and sections on the Classes page first."
            }
          />
        </div>
      ) : c.timetable.isError ? (
        <ErrorState error={c.timetable.error} onRetry={() => c.timetable.refetch()} />
      ) : (
        <WeekGrid
          slots={c.slots}
          isLoading={c.timetable.isLoading}
          emptyDescription={
            isTeacher
              ? "Your school admin sets up your week on the Timetable page."
              : "Use Add period to build this section's week."
          }
          showSection={isTeacher}
          onDelete={c.askRemove}
        />
      )}

      {!isTeacher && sectionId && (
        <PeriodDialog
          organizationId={c.organizationId}
          academicYearId={academicYearId}
          classId={classId}
          sectionId={sectionId}
          assignments={c.sectionAssignments}
          subjects={c.subjects}
          open={c.isAdding}
          onClose={c.closeAdd}
        />
      )}
      <DeleteConfirmationDialog
        open={!!toRemove}
        onClose={c.closeRemove}
        title="Remove period?"
        description={
          toRemove
            ? `${toRemove.subjectId?.name ?? "This period"} on ${DAY_NAMES[toRemove.dayOfWeek]}, ${formatTime(toRemove.startTime)} to ${formatTime(toRemove.endTime)}.`
            : ""
        }
        confirmLabel="Remove"
        isLoading={c.isRemoving}
        onConfirm={c.confirmRemove}
      />
    </div>
  );
};

export default Timetable;
