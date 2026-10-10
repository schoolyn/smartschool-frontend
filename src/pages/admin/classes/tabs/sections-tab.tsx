import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import CustomSelectDropdown from "@/components/custom-select";
import DeleteConfirmationDialog from "@/components/delete-confirmation-dialog";
import EmptyState from "@/components/empty-state";
import FormDialog from "@/components/form-dialog";
import RowMenu, { RowMenuItem } from "@/components/row-menu";
import Spinner from "@/components/spinner";
import StatusBadge from "@/components/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { useMutationFeedback } from "@/hooks";
import { ISection } from "@/types";
import {
  useCreateSection,
  useDeactivateSection,
  useGetClasses,
  useGetSections,
  useUpdateSection,
} from "../service/academics-service";
import { useGetAllTeachers } from "../service/teachers-service";
import { defaultSectionFormValues, sectionFormSchema, SectionFormValues } from "../classes.schema";
import { SelectField, TextField } from "../components/form-fields";
import ShowInactiveToggle from "../components/show-inactive-toggle";
import Toolbar, { PrimaryButton } from "../components/toolbar";

interface SectionsTabProps {
  organizationId: string;
  yearId: string;
  classId: string;
  onClassChange: (classId: string) => void;
}

const NO_TEACHER = "none";

const SectionsTab = ({ organizationId, yearId, classId, onClassChange }: SectionsTabProps) => {
  const [showInactive, setShowInactive] = useState(false);

  // all classes load so an inactive one opened from the classes tab still shows its sections
  const classes = useGetClasses(organizationId, yearId);
  const allClasses = classes.data?.items ?? [];
  const classOptions = allClasses.filter((klass) => klass.status === "active" || klass.id === classId);
  const selectedClass = classOptions.find((klass) => klass.id === classId);
  const classInactive = selectedClass?.status === "inactive";

  // an inactive class only has inactive sections, so they show without the toggle
  const sections = useGetSections(organizationId, classId, showInactive || classInactive ? undefined : "active");
  const teachers = useGetAllTeachers(organizationId);
  const createSection = useCreateSection(organizationId);
  const updateSection = useUpdateSection(organizationId);
  const deactivateSection = useDeactivateSection(organizationId);

  const [dialog, setDialog] = useState<{ section?: ISection } | null>(null);
  const [toDeactivate, setToDeactivate] = useState<ISection | null>(null);

  const form = useForm<SectionFormValues>({
    resolver: zodResolver(sectionFormSchema),
    defaultValues: defaultSectionFormValues,
  });

  const teacherOptions = useMemo(
    () => [
      { id: NO_TEACHER, name: "No class teacher" },
      ...(teachers.data?.items ?? []).map((teacher) => ({
        id: teacher.id,
        name: `${teacher.name} (${teacher.email})`,
      })),
    ],
    [teachers.data],
  );

  useEffect(() => {
    if (!dialog) return;
    const section = dialog.section;
    form.reset(
      section
        ? {
            name: section.name,
            capacity: section.capacity?.toString() ?? "",
            roomNumber: section.roomNumber ?? "",
            classTeacherId: section.classTeacherId?.id ?? NO_TEACHER,
          }
        : { ...defaultSectionFormValues, classTeacherId: NO_TEACHER },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialog]);

  useMutationFeedback(createSection, "Section created", () => setDialog(null));
  useMutationFeedback(updateSection, "Section updated", () => setDialog(null));
  useMutationFeedback(deactivateSection, "Section deactivated", () => setToDeactivate(null));

  const submit = form.handleSubmit((values) => {
    const capacity = values.capacity ? Number(values.capacity) : null;
    const classTeacherId = values.classTeacherId === NO_TEACHER ? null : values.classTeacherId;

    if (dialog?.section) {
      // empty fields are sent as cleared so removing a capacity, room or teacher actually saves
      updateSection.mutate({
        id: dialog.section.id,
        name: values.name,
        capacity,
        roomNumber: values.roomNumber,
        classTeacherId,
      });
    } else {
      createSection.mutate({
        name: values.name,
        capacity: capacity ?? undefined,
        roomNumber: values.roomNumber || undefined,
        classTeacherId: classTeacherId ?? undefined,
        classId,
        academicYearId: yearId,
      });
    }
  });

  const menuFor = (section: ISection): RowMenuItem[] => [
    { label: "Edit", onSelect: () => setDialog({ section }) },
    section.status === "active"
      ? { label: "Deactivate", onSelect: () => setToDeactivate(section), danger: true }
      : { label: "Reactivate", onSelect: () => updateSection.mutate({ id: section.id, status: "active" }) },
  ];

  const items = sections.data?.items ?? [];
  const addButton = <PrimaryButton onClick={() => setDialog({})}>+ Add section</PrimaryButton>;

  return (
    <div className="rounded-lg bg-white shadow">
      <Toolbar
        title={
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Class</span>
            <CustomSelectDropdown
              className="w-44"
              placeholder="Select class"
              options={classOptions.map((klass) => ({ id: klass.id, name: klass.name }))}
              value={selectedClass ? { id: selectedClass.id, name: selectedClass.name } : null}
              onChange={(option) => onClassChange(String(option.id))}
            />
          </div>
        }
      >
        <ShowInactiveToggle checked={showInactive} onChange={setShowInactive} />
        {selectedClass && !classInactive && addButton}
      </Toolbar>

      {!classId ? (
        <EmptyState
          title="Choose a class"
          description="Sections are the divisions of a class, such as A and B. Pick a class above to see or add them."
        />
      ) : sections.isLoading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState
          title="No sections in this class"
          description="Add a section, such as A, and set how many students it can hold."
          action={classInactive ? undefined : addButton}
        />
      ) : (
        <div className="p-4">
          <Table>
            <TableHeader>
              <TableHead>Section</TableHead>
              <TableHead className="text-center">Students</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Class teacher</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableHeader>
            <TableBody>
              {items.map((section) => {
                const students = section.studentCount ?? 0;
                const full = !!section.capacity && students >= section.capacity;
                return (
                  <TableRow key={section.id}>
                    <TableCell className="font-medium text-gray-900">{section.name}</TableCell>
                    <TableCell className="text-center">
                      {students}
                      {section.capacity ? ` / ${section.capacity}` : ""}
                      {full && (
                        <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">Full</span>
                      )}
                    </TableCell>
                    <TableCell>{section.roomNumber || "-"}</TableCell>
                    <TableCell>{section.classTeacherId?.name || "-"}</TableCell>
                    <TableCell>
                      <StatusBadge status={section.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <RowMenu items={menuFor(section)} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <FormDialog
        form={form}
        open={!!dialog}
        onClose={() => setDialog(null)}
        title={dialog?.section ? "Edit section" : `Add section${selectedClass ? ` to ${selectedClass.name}` : ""}`}
        submitLabel={dialog?.section ? "Save changes" : "Add section"}
        isSubmitting={createSection.isPending || updateSection.isPending}
        onSubmit={submit}
      >
        <TextField form={form} name="name" label="Name" placeholder="A" autoFocus />
        <div className="grid grid-cols-2 gap-4">
          <TextField form={form} name="capacity" label="Capacity (optional)" placeholder="40" />
          <TextField form={form} name="roomNumber" label="Room (optional)" placeholder="12" />
        </div>
        <SelectField form={form} name="classTeacherId" label="Class teacher" options={teacherOptions} />
      </FormDialog>

      <DeleteConfirmationDialog
        open={!!toDeactivate}
        onClose={() => setToDeactivate(null)}
        onConfirm={() => toDeactivate && deactivateSection.mutate(toDeactivate.id)}
        isLoading={deactivateSection.isPending}
        title={`Deactivate section ${toDeactivate?.name ?? ""}?`}
        description="Nothing new can be added to it. This is only possible once it has no active students. History is kept, and you can reactivate it later."
        confirmLabel="Deactivate"
      />
    </div>
  );
};

export default SectionsTab;
