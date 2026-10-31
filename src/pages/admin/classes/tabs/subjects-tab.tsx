import { PlusIcon } from "@heroicons/react/20/solid";

import type { Action } from "@/shared/ui/action-buttons";
import { useHeaderActions } from "@/shared/ui/section-header";
import DataTable from "@/shared/ui/data-table";
import DeleteConfirmationDialog from "@/shared/ui/delete-confirmation-dialog";
import FormDialog from "@/shared/ui/form-dialog";
import { SelectField, TextField } from "@/shared/ui/form-fields";
import { IAcademicYear } from "@/entities/academics";
import { SUBJECT_TYPES } from "../classes.schema";
import ShowInactiveToggle from "../components/show-inactive-toggle";
import YearPicker from "../components/year-picker";
import { subjectColumns, TYPE_LABELS } from "./subjects-tab-columns";
import useSubjectsTabController from "./subjects-tab-controller";

const TYPE_OPTIONS = SUBJECT_TYPES.map((type) => ({ id: type, name: TYPE_LABELS[type] }));

interface SubjectsTabProps {
  organizationId: string;
  years: IAcademicYear[];
  yearId: string;
  onYearChange: (yearId: string) => void;
}

const SubjectsTab = ({ organizationId, years, yearId, onYearChange }: SubjectsTabProps) => {
  const c = useSubjectsTabController(organizationId, yearId);
  const addAction: Action = { label: "Add subject", icon: PlusIcon, onClick: c.openAdd, variant: "primary" };
  useHeaderActions({ action: { ...addAction, hidden: !yearId } });

  return (
    <div>
      <DataTable
        columns={subjectColumns(c.menuFor)}
        data={c.items}
        getRowId={(subject) => subject.id}
        isLoading={c.isLoading}
        itemLabel={{ one: "subject", other: "subjects" }}
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
                title: "No subjects in this year",
                description:
                  "Add the subjects you teach, such as Mathematics (MATH). Homework, marks and teacher assignments use them.",
              }
            : {
                title: "Choose an academic year",
                description: "Subjects are set up per academic year. Pick one from the year menu, or add a year first.",
              }
        }
      />

      <FormDialog
        form={c.form}
        open={!!c.dialog}
        onClose={c.closeDialog}
        title={c.dialog?.subject ? "Edit subject" : "Add subject"}
        submitLabel={c.dialog?.subject ? "Save changes" : "Add subject"}
        isSubmitting={c.isSubmitting}
        onSubmit={c.submit}
      >
        <TextField form={c.form} name="name" label="Name" placeholder="Mathematics" autoFocus />
        <TextField form={c.form} name="code" label="Code" placeholder="MATH" />
        <SelectField form={c.form} name="type" label="Type" options={TYPE_OPTIONS} />
      </FormDialog>

      <DeleteConfirmationDialog
        open={!!c.toDeactivate}
        onClose={c.closeDeactivate}
        onConfirm={c.confirmDeactivate}
        isLoading={c.isDeactivating}
        title={`Deactivate ${c.toDeactivate?.name ?? "subject"}?`}
        description="It will no longer be offered for new homework or assignments. Existing records keep it, and you can reactivate it later."
        confirmLabel="Deactivate"
      />
    </div>
  );
};

export default SubjectsTab;
