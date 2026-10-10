import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import DeleteConfirmationDialog from "@/components/delete-confirmation-dialog";
import EmptyState from "@/components/empty-state";
import FormDialog from "@/components/form-dialog";
import RowMenu from "@/components/row-menu";
import Spinner from "@/components/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { useMutationFeedback } from "@/hooks";
import { ITeacherAssignment } from "@/types";
import {
  useAssignTeacher,
  useGetClasses,
  useGetSections,
  useGetSubjects,
  useGetTeacherAssignments,
  useRemoveTeacherAssignment,
} from "../service/academics-service";
import { useGetAllTeachers } from "../service/teachers-service";
import { assignFormSchema, AssignFormValues, defaultAssignFormValues } from "../classes.schema";
import { SelectField } from "../components/form-fields";
import Toolbar, { PrimaryButton } from "../components/toolbar";

const ROLE_OPTIONS = [
  { id: "SUBJECT_TEACHER", name: "Subject teacher" },
  { id: "CLASS_TEACHER", name: "Class teacher" },
];
const ROLE_LABELS: Record<string, string> = Object.fromEntries(ROLE_OPTIONS.map((role) => [role.id, role.name]));

const AssignmentsTab = ({ organizationId, yearId }: { organizationId: string; yearId: string }) => {
  const assignments = useGetTeacherAssignments(organizationId);
  const teachers = useGetAllTeachers(organizationId);
  const classes = useGetClasses(organizationId, yearId, "active");
  const subjects = useGetSubjects(organizationId, yearId, "active");
  const assign = useAssignTeacher(organizationId);
  const remove = useRemoveTeacherAssignment(organizationId);

  const [open, setOpen] = useState(false);
  const [toRemove, setToRemove] = useState<ITeacherAssignment | null>(null);

  const form = useForm<AssignFormValues>({
    resolver: zodResolver(assignFormSchema),
    defaultValues: defaultAssignFormValues,
  });
  const classId = form.watch("classId");
  const role = form.watch("role");
  const sections = useGetSections(organizationId, classId || undefined, "active");

  useEffect(() => {
    if (open) form.reset(defaultAssignFormValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    form.setValue("sectionId", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  useMutationFeedback(assign, "Teacher assigned", () => setOpen(false));
  useMutationFeedback(remove, "Assignment removed", () => setToRemove(null));

  const submit = form.handleSubmit((values) => {
    assign.mutate({
      teacherUserId: values.teacherId,
      academicYearId: yearId,
      classId: values.classId,
      sectionId: values.sectionId,
      subjectId: values.role === "SUBJECT_TEACHER" ? values.subjectId : undefined,
      assignmentRole: values.role,
    });
  });

  // removed assignments are kept by the server as history; the list shows only the ones in force
  const items = useMemo(
    () => (assignments.data?.items ?? []).filter((item) => item.status === "active"),
    [assignments.data],
  );
  const addButton = <PrimaryButton onClick={() => setOpen(true)}>+ Assign teacher</PrimaryButton>;

  return (
    <div className="rounded-lg bg-white shadow">
      <Toolbar title="Teacher assignments">{yearId && items.length > 0 && addButton}</Toolbar>

      {assignments.isLoading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState
          title="No teachers assigned yet"
          description="Assign teachers to the sections they teach, and choose each section's class teacher. Teachers see only the sections they are assigned to."
          action={yearId ? addButton : undefined}
        />
      ) : (
        <div className="p-4">
          <Table>
            <TableHeader>
              <TableHead>Teacher</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-gray-900">{item.teacherUserId?.name}</TableCell>
                  <TableCell>{item.classId?.name}</TableCell>
                  <TableCell>{item.sectionId?.name}</TableCell>
                  <TableCell>{item.subjectId?.name || "-"}</TableCell>
                  <TableCell>{ROLE_LABELS[item.assignmentRole] ?? item.assignmentRole}</TableCell>
                  <TableCell className="text-right">
                    <RowMenu
                      items={[{ label: "Remove assignment", onSelect: () => setToRemove(item), danger: true }]}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <FormDialog
        form={form}
        open={open}
        onClose={() => setOpen(false)}
        title="Assign teacher"
        description="Choose where this teacher teaches. Only teachers of this school can be assigned."
        submitLabel="Assign"
        isSubmitting={assign.isPending}
        onSubmit={submit}
      >
        <SelectField
          form={form}
          name="teacherId"
          label="Teacher"
          placeholder="Select teacher"
          options={(teachers.data?.items ?? []).map((teacher) => ({
            id: teacher.id,
            name: `${teacher.name} (${teacher.email})`,
          }))}
        />
        <div className="grid grid-cols-2 gap-4">
          <SelectField
            form={form}
            name="classId"
            label="Class"
            placeholder="Select class"
            options={(classes.data?.items ?? []).map((klass) => ({ id: klass.id, name: klass.name }))}
          />
          <SelectField
            form={form}
            name="sectionId"
            label="Section"
            placeholder="Select section"
            disabled={!classId}
            options={(sections.data?.items ?? []).map((section) => ({ id: section.id, name: section.name }))}
          />
        </div>
        <SelectField form={form} name="role" label="Role" options={ROLE_OPTIONS} />
        {role === "SUBJECT_TEACHER" && (
          <SelectField
            form={form}
            name="subjectId"
            label="Subject"
            placeholder="Select subject"
            options={(subjects.data?.items ?? []).map((subject) => ({ id: subject.id, name: subject.name }))}
          />
        )}
      </FormDialog>

      <DeleteConfirmationDialog
        open={!!toRemove}
        onClose={() => setToRemove(null)}
        onConfirm={() => toRemove && remove.mutate(toRemove.id)}
        isLoading={remove.isPending}
        title="Remove this assignment?"
        description={
          toRemove
            ? `${toRemove.teacherUserId?.name} will no longer teach ${toRemove.classId?.name} ${toRemove.sectionId?.name}${
                toRemove.assignmentRole === "CLASS_TEACHER" ? " and will stop being its class teacher" : ""
              }.`
            : ""
        }
        confirmLabel="Remove"
      />
    </div>
  );
};

export default AssignmentsTab;
