import { PlusIcon } from "@heroicons/react/20/solid";

import type { Action } from "@/shared/ui/action-buttons";
import { useHeaderActions } from "@/shared/ui/section-header";
import DataTable from "@/shared/ui/data-table";
import DeleteConfirmationDialog from "@/shared/ui/delete-confirmation-dialog";
import FormDialog from "@/shared/ui/form-dialog";
import { TextField } from "@/shared/ui/form-fields";
import { IAcademicYear } from "@/entities/academics";
import ShowInactiveToggle from "../components/show-inactive-toggle";
import YearPicker from "../components/year-picker";
import { classColumns } from "./classes-tab-columns";
import useClassesTabController from "./classes-tab-controller";

interface ClassesTabProps {
  organizationId: string;
  years: IAcademicYear[];
  yearId: string;
  onYearChange: (yearId: string) => void;
  onViewSections: (classId: string) => void;
}

const ClassesTab = ({ organizationId, years, yearId, onYearChange, onViewSections }: ClassesTabProps) => {
  const c = useClassesTabController(organizationId, yearId, onViewSections);
  const addAction: Action = { label: "Add class", icon: PlusIcon, onClick: c.openAdd, variant: "primary" };
  useHeaderActions({ action: { ...addAction, hidden: !yearId } });

  return (
    <div>
      <DataTable
        columns={classColumns(c.menuFor)}
        data={c.items}
        getRowId={(klass) => klass.id}
        isLoading={c.isLoading}
        itemLabel={{ one: "class", other: "classes" }}
        pagination={{ pageSize: 20 }}
        toolbar={
          <>
            <YearPicker years={years} value={yearId} onChange={onYearChange} />
            <ShowInactiveToggle checked={c.showInactive} onChange={c.setShowInactive} />
          </>
        }
        empty={
          yearId
            ? {
                title: c.showInactive ? "No classes in this year" : "No active classes in this year",
                description:
                  "Add the classes your school runs, such as Grade 1 or Grade 2. Sections and students are organised under them.",
              }
            : {
                title: "Choose an academic year",
                description: "Classes belong to an academic year. Pick one from the year menu, or add a year first.",
              }
        }
      />

      <FormDialog
        form={c.form}
        open={!!c.dialog}
        onClose={c.closeDialog}
        title={c.dialog?.klass ? "Edit class" : "Add class"}
        submitLabel={c.dialog?.klass ? "Save changes" : "Add class"}
        isSubmitting={c.isSubmitting}
        onSubmit={c.submit}
      >
        <TextField form={c.form} name="name" label="Name" placeholder="Grade 1" autoFocus />
        <TextField form={c.form} name="numericLevel" label="Level (optional)" placeholder="1" />
      </FormDialog>

      <DeleteConfirmationDialog
        open={!!c.toDeactivate}
        onClose={c.closeDeactivate}
        onConfirm={c.confirmDeactivate}
        isLoading={c.isDeactivating}
        title={`Deactivate ${c.toDeactivate?.name ?? "class"}?`}
        description="Its sections are deactivated with it, and nothing new can be added to it. This is only possible once it has no active students. History is kept, and you can reactivate it later."
        confirmLabel="Deactivate"
      />
    </div>
  );
};

export default ClassesTab;
