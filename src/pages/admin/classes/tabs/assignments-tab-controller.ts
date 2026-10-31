import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useMutationFeedback } from "@/shared/lib/hooks";
import { ITeacherAssignment } from "@/entities/academics";
import {
  useAssignTeacher,
  useGetClasses,
  useGetSections,
  useGetSubjects,
  useGetTeacherAssignments,
  useRemoveTeacherAssignment,
} from "@/entities/academics";
import { useGetAllTeachers } from "@/entities/academics";
import { assignFormSchema, AssignFormValues, defaultAssignFormValues } from "../classes.schema";

const useAssignmentsTabController = (organizationId: string, yearId: string) => {
  const assignments = useGetTeacherAssignments(organizationId, yearId);
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
    [assignments.data]
  );

  const teacherOptions = useMemo(
    () =>
      (teachers.data?.items ?? []).map((teacher) => ({
        id: teacher.userId,
        name: `${teacher.name} (${teacher.email})`,
      })),
    [teachers.data]
  );

  return {
    items,
    isLoading: assignments.isLoading,
    form,
    classId,
    role,
    teacherOptions,
    classOptions: (classes.data?.items ?? []).map((klass) => ({ id: klass.id, name: klass.name })),
    sectionOptions: (sections.data?.items ?? []).map((section) => ({ id: section.id, name: section.name })),
    subjectOptions: (subjects.data?.items ?? []).map((subject) => ({ id: subject.id, name: subject.name })),
    open,
    openAssign: () => setOpen(true),
    closeAssign: () => setOpen(false),
    submit,
    isAssigning: assign.isPending,
    toRemove,
    askRemove: setToRemove,
    closeRemove: () => setToRemove(null),
    confirmRemove: () => toRemove && remove.mutate(toRemove.id),
    isRemoving: remove.isPending,
  };
};

export default useAssignmentsTabController;
