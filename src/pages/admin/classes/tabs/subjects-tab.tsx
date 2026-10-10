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
import { IAcademicYear, ISubject } from "@/types";
import { useCreateSubject, useDeactivateSubject, useGetSubjects, useUpdateSubject } from "../service/academics-service";
import { defaultSubjectFormValues, SUBJECT_TYPES, subjectFormSchema, SubjectFormValues } from "../classes.schema";
import { SelectField, TextField } from "../components/form-fields";
import ShowInactiveToggle from "../components/show-inactive-toggle";
import Toolbar, { PrimaryButton } from "../components/toolbar";
import YearPicker from "../components/year-picker";

const TYPE_LABELS: Record<string, string> = { core: "Core", elective: "Elective", co_curricular: "Co-curricular" };
const TYPE_OPTIONS = SUBJECT_TYPES.map((type) => ({ id: type, name: TYPE_LABELS[type] }));

interface SubjectsTabProps {
  organizationId: string;
  years: IAcademicYear[];
  yearId: string;
  onYearChange: (yearId: string) => void;
}

const SubjectsTab = ({ organizationId, years, yearId, onYearChange }: SubjectsTabProps) => {
  const [showInactive, setShowInactive] = useState(false);
  const subjects = useGetSubjects(organizationId, yearId, showInactive ? undefined : "active");
  const createSubject = useCreateSubject(organizationId);
  const updateSubject = useUpdateSubject(organizationId);
  const deactivateSubject = useDeactivateSubject(organizationId);

  const [dialog, setDialog] = useState<{ subject?: ISubject } | null>(null);
  const [toDeactivate, setToDeactivate] = useState<ISubject | null>(null);

  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: defaultSubjectFormValues,
  });

  useEffect(() => {
    if (!dialog) return;
    const subject = dialog.subject;
    form.reset(
      subject
        ? { name: subject.name, code: subject.code, type: (subject.type as SubjectFormValues["type"]) ?? "core" }
        : defaultSubjectFormValues,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialog]);

  useMutationFeedback(createSubject, "Subject created", () => setDialog(null));
  useMutationFeedback(updateSubject, "Subject updated", () => setDialog(null));
  useMutationFeedback(deactivateSubject, "Subject deactivated", () => setToDeactivate(null));

  const submit = form.handleSubmit((values) => {
    if (dialog?.subject) {
      updateSubject.mutate({ id: dialog.subject.id, ...values });
    } else {
      createSubject.mutate({ ...values, academicYearId: yearId });
    }
  });

  const menuFor = (subject: ISubject): RowMenuItem[] => [
    { label: "Edit", onSelect: () => setDialog({ subject }) },
    subject.status === "active"
      ? { label: "Deactivate", onSelect: () => setToDeactivate(subject), danger: true }
      : { label: "Reactivate", onSelect: () => updateSubject.mutate({ id: subject.id, status: "active" }) },
  ];

  const items = subjects.data?.items ?? [];
  const addButton = <PrimaryButton onClick={() => setDialog({})}>+ Add subject</PrimaryButton>;

  return (
    <div className="rounded-lg bg-white shadow">
      <Toolbar title={<YearPicker years={years} value={yearId} onChange={onYearChange} />}>
        <ShowInactiveToggle checked={showInactive} onChange={setShowInactive} />
        {yearId && addButton}
      </Toolbar>

      {!yearId ? (
        <EmptyState
          title="Choose an academic year"
          description="Subjects are set up per academic year. Pick one above, or add a year first."
        />
      ) : subjects.isLoading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState
          title="No subjects in this year"
          description="Add the subjects you teach, such as Mathematics (MATH). Homework, marks and teacher assignments use them."
          action={addButton}
        />
      ) : (
        <div className="p-4">
          <Table>
            <TableHeader>
              <TableHead>Subject</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableHeader>
            <TableBody>
              {items.map((subject) => (
                <TableRow key={subject.id}>
                  <TableCell className="font-medium text-gray-900">{subject.name}</TableCell>
                  <TableCell>{subject.code}</TableCell>
                  <TableCell>{TYPE_LABELS[subject.type] ?? subject.type}</TableCell>
                  <TableCell>
                    <StatusBadge status={subject.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <RowMenu items={menuFor(subject)} />
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
        title={dialog?.subject ? "Edit subject" : "Add subject"}
        submitLabel={dialog?.subject ? "Save changes" : "Add subject"}
        isSubmitting={createSubject.isPending || updateSubject.isPending}
        onSubmit={submit}
      >
        <TextField form={form} name="name" label="Name" placeholder="Mathematics" autoFocus />
        <TextField form={form} name="code" label="Code" placeholder="MATH" />
        <SelectField form={form} name="type" label="Type" options={TYPE_OPTIONS} />
      </FormDialog>

      <DeleteConfirmationDialog
        open={!!toDeactivate}
        onClose={() => setToDeactivate(null)}
        onConfirm={() => toDeactivate && deactivateSubject.mutate(toDeactivate.id)}
        isLoading={deactivateSubject.isPending}
        title={`Deactivate ${toDeactivate?.name ?? "subject"}?`}
        description="It will no longer be offered for new homework or assignments. Existing records keep it, and you can reactivate it later."
        confirmLabel="Deactivate"
      />
    </div>
  );
};

export default SubjectsTab;
