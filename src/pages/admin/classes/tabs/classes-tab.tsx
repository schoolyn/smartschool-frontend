import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import DeleteConfirmationDialog from "@/components/delete-confirmation-dialog";
import EmptyState from "@/components/empty-state";
import FormDialog from "@/components/form-dialog";
import RowMenu, { RowMenuItem } from "@/components/row-menu";
import Spinner from "@/components/spinner";
import StatusBadge from "@/components/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { useMutationFeedback } from "@/hooks";
import { IAcademicYear, IClass } from "@/types";
import { useCreateClass, useDeactivateClass, useGetClasses, useUpdateClass } from "../service/academics-service";
import { classFormSchema, ClassFormValues, defaultClassFormValues } from "../classes.schema";
import { TextField } from "../components/form-fields";
import ShowInactiveToggle from "../components/show-inactive-toggle";
import Toolbar, { PrimaryButton } from "../components/toolbar";
import YearPicker from "../components/year-picker";

interface ClassesTabProps {
  organizationId: string;
  years: IAcademicYear[];
  yearId: string;
  onYearChange: (yearId: string) => void;
  onViewSections: (classId: string) => void;
}

const ClassesTab = ({ organizationId, years, yearId, onYearChange, onViewSections }: ClassesTabProps) => {
  const [showInactive, setShowInactive] = useState(false);
  const classes = useGetClasses(organizationId, yearId, showInactive ? undefined : "active");
  const createClass = useCreateClass(organizationId);
  const updateClass = useUpdateClass(organizationId);
  const deactivateClass = useDeactivateClass(organizationId);

  const [dialog, setDialog] = useState<{ klass?: IClass } | null>(null);
  const [toDeactivate, setToDeactivate] = useState<IClass | null>(null);

  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classFormSchema),
    defaultValues: defaultClassFormValues,
  });

  useEffect(() => {
    if (!dialog) return;
    form.reset(
      dialog.klass
        ? { name: dialog.klass.name, numericLevel: dialog.klass.numericLevel?.toString() ?? "" }
        : defaultClassFormValues,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialog]);

  useMutationFeedback(createClass, "Class created", () => setDialog(null));
  useMutationFeedback(updateClass, "Class updated", () => setDialog(null));
  useMutationFeedback(deactivateClass, "Class deactivated", () => setToDeactivate(null));

  const submit = form.handleSubmit((values) => {
    const numericLevel = values.numericLevel ? Number(values.numericLevel) : null;
    if (dialog?.klass) {
      updateClass.mutate({ id: dialog.klass.id, name: values.name, numericLevel });
    } else {
      createClass.mutate({ name: values.name, numericLevel: numericLevel ?? undefined, academicYearId: yearId });
    }
  });

  const menuFor = (klass: IClass): RowMenuItem[] => [
    { label: "Edit", onSelect: () => setDialog({ klass }) },
    { label: "View sections", onSelect: () => onViewSections(klass.id) },
    klass.status === "active"
      ? { label: "Deactivate", onSelect: () => setToDeactivate(klass), danger: true }
      : { label: "Reactivate", onSelect: () => updateClass.mutate({ id: klass.id, status: "active" }) },
  ];

  const items = classes.data?.items ?? [];
  const addButton = <PrimaryButton onClick={() => setDialog({})}>+ Add class</PrimaryButton>;

  return (
    <div className="rounded-lg bg-white shadow">
      <Toolbar title={<YearPicker years={years} value={yearId} onChange={onYearChange} />}>
        <ShowInactiveToggle checked={showInactive} onChange={setShowInactive} />
        {yearId && addButton}
      </Toolbar>

      {!yearId ? (
        <EmptyState
          title="Choose an academic year"
          description="Classes belong to an academic year. Pick one above, or add a year first."
        />
      ) : classes.isLoading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState
          title={showInactive ? "No classes in this year" : "No active classes in this year"}
          description="Add the classes your school runs, such as Grade 1 or Grade 2. Sections and students are organised under them."
          action={addButton}
        />
      ) : (
        <div className="p-4">
          <Table>
            <TableHeader>
              <TableHead>Class</TableHead>
              <TableHead className="text-center">Level</TableHead>
              <TableHead className="text-center">Sections</TableHead>
              <TableHead className="text-center">Students</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableHeader>
            <TableBody>
              {items.map((klass) => (
                <TableRow key={klass.id}>
                  <TableCell className="font-medium text-gray-900">{klass.name}</TableCell>
                  <TableCell className="text-center">{klass.numericLevel ?? "-"}</TableCell>
                  <TableCell className="text-center">{klass.sectionCount ?? 0}</TableCell>
                  <TableCell className="text-center">{klass.studentCount ?? 0}</TableCell>
                  <TableCell>
                    <StatusBadge status={klass.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <RowMenu items={menuFor(klass)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <FormDialog
        form={form}
        open={!!dialog}
        onClose={() => setDialog(null)}
        title={dialog?.klass ? "Edit class" : "Add class"}
        submitLabel={dialog?.klass ? "Save changes" : "Add class"}
        isSubmitting={createClass.isPending || updateClass.isPending}
        onSubmit={submit}
      >
        <TextField form={form} name="name" label="Name" placeholder="Grade 1" autoFocus />
        <TextField form={form} name="numericLevel" label="Level (optional)" placeholder="1" />
      </FormDialog>

      <DeleteConfirmationDialog
        open={!!toDeactivate}
        onClose={() => setToDeactivate(null)}
        onConfirm={() => toDeactivate && deactivateClass.mutate(toDeactivate.id)}
        isLoading={deactivateClass.isPending}
        title={`Deactivate ${toDeactivate?.name ?? "class"}?`}
        description="Its sections are deactivated with it, and nothing new can be added to it. This is only possible once it has no active students. History is kept, and you can reactivate it later."
        confirmLabel="Deactivate"
      />
    </div>
  );
};

export default ClassesTab;
