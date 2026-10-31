import { PlusIcon } from "@heroicons/react/20/solid";

import type { Action } from "@/shared/ui/action-buttons";
import { useHeaderActions } from "@/shared/ui/section-header";
import CustomSelectDropdown from "@/shared/ui/custom-select";
import DataTable from "@/shared/ui/data-table";
import DeleteConfirmationDialog from "@/shared/ui/delete-confirmation-dialog";
import FormDialog from "@/shared/ui/form-dialog";
import { SelectField, TextField } from "@/shared/ui/form-fields";
import ShowInactiveToggle from "../components/show-inactive-toggle";
import { sectionColumns } from "./sections-tab-columns";
import useSectionsTabController from "./sections-tab-controller";

interface SectionsTabProps {
  organizationId: string;
  yearId: string;
  classId: string;
  onClassChange: (classId: string) => void;
}

const SectionsTab = ({ organizationId, yearId, classId, onClassChange }: SectionsTabProps) => {
  const c = useSectionsTabController(organizationId, yearId, classId);
  const addAction: Action = { label: "Add section", icon: PlusIcon, onClick: c.openAdd, variant: "primary" };
  useHeaderActions({ action: { ...addAction, hidden: !c.selectedClass || c.classInactive } });

  return (
    <div>
      <DataTable
        columns={sectionColumns(c.menuFor)}
        data={c.items}
        getRowId={(section) => section.id}
        isLoading={c.isLoading}
        itemLabel={{ one: "section", other: "sections" }}
        pagination={{ pageSize: 20 }}
        toolbar={
          <>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Class</span>
              <CustomSelectDropdown
                className="w-44"
                placeholder="Select class"
                options={c.classOptions.map((klass) => ({ id: klass.id, name: klass.name }))}
                value={c.selectedClass ? { id: c.selectedClass.id, name: c.selectedClass.name } : null}
                onChange={(option) => onClassChange(String(option.id))}
              />
            </div>
            <ShowInactiveToggle checked={c.showInactive} onChange={c.setShowInactive} />
          </>
        }
        empty={
          classId
            ? {
                title: "No sections in this class",
                description: "Add a section, such as A, and set how many students it can hold.",
              }
            : {
                title: "Choose a class",
                description:
                  "Sections are the divisions of a class, such as A and B. Pick a class from the class menu to see or add them; no classes yet? Add them in the Classes tab.",
              }
        }
      />

      <FormDialog
        form={c.form}
        open={!!c.dialog}
        onClose={c.closeDialog}
        title={
          c.dialog?.section ? "Edit section" : `Add section${c.selectedClass ? ` to ${c.selectedClass.name}` : ""}`
        }
        submitLabel={c.dialog?.section ? "Save changes" : "Add section"}
        isSubmitting={c.isSubmitting}
        onSubmit={c.submit}
      >
        <TextField form={c.form} name="name" label="Name" placeholder="A" autoFocus />
        <div className="grid grid-cols-2 gap-4">
          <TextField form={c.form} name="capacity" label="Capacity (optional)" placeholder="40" />
          <TextField form={c.form} name="roomNumber" label="Room (optional)" placeholder="12" />
        </div>
        <SelectField form={c.form} name="classTeacherId" label="Class teacher" options={c.teacherOptions} />
      </FormDialog>

      <DeleteConfirmationDialog
        open={!!c.toDeactivate}
        onClose={c.closeDeactivate}
        onConfirm={c.confirmDeactivate}
        isLoading={c.isDeactivating}
        title={`Deactivate section ${c.toDeactivate?.name ?? ""}?`}
        description="Nothing new can be added to it. This is only possible once it has no active students. History is kept, and you can reactivate it later."
        confirmLabel="Deactivate"
      />
    </div>
  );
};

export default SectionsTab;
