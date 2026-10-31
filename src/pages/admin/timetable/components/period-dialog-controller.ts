import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { ISubject, ITeacherAssignment } from "@/entities/academics";
import { SelectOption } from "@/shared/types";
import { defaultPeriodValues, periodSchema, PeriodFormValues } from "../timetable.schema";
import { DAY_NAMES } from "../timetable.utils";
import { useCreateTimetableSlot } from "@/entities/timetable";

interface PeriodDialogControllerArgs {
  organizationId: string;
  academicYearId: string;
  classId: string;
  sectionId: string;
  assignments: ITeacherAssignment[];
  subjects: ISubject[];
  open: boolean;
  onClose: () => void;
}

// one period, added to every chosen day at once; a clash on one day doesn't stop the others
const usePeriodDialogController = ({
  organizationId,
  academicYearId,
  classId,
  sectionId,
  assignments,
  subjects,
  open,
  onClose,
}: PeriodDialogControllerArgs) => {
  const create = useCreateTimetableSlot(organizationId);
  const [isSaving, setIsSaving] = useState(false);
  const form = useForm<PeriodFormValues>({ resolver: zodResolver(periodSchema), defaultValues: defaultPeriodValues });

  useEffect(() => {
    if (open) form.reset(defaultPeriodValues);
  }, [open, form]);

  const teacherOptions: SelectOption[] = [
    ...new Map(assignments.map((a) => [a.teacherUserId.id, a.teacherUserId.name])).entries(),
  ].map(([id, name]) => ({ id, name }));
  const subjectOptions: SelectOption[] = subjects.map((subject) => ({ id: subject.id, name: subject.name }));

  // a subject teacher's own subject is the likely choice
  const pickTeacher = (teacherUserId: string) => {
    const subjectId = assignments.find((a) => a.teacherUserId.id === teacherUserId && a.subjectId)?.subjectId?.id;
    if (subjectId) form.setValue("subjectId", subjectId, { shouldValidate: true });
  };

  const submit = form.handleSubmit(async (values) => {
    setIsSaving(true);
    const problems: string[] = [];
    for (const day of values.days) {
      try {
        await create.mutateAsync({
          academicYearId,
          classId,
          sectionId,
          subjectId: values.subjectId,
          teacherUserId: values.teacherUserId,
          dayOfWeek: Number(day),
          startTime: values.startTime,
          endTime: values.endTime,
          room: values.room || undefined,
        });
      } catch (error) {
        const message =
          (error as { response?: { Error?: { message?: string } } }).response?.Error?.message ?? "Could not be added.";
        problems.push(`${DAY_NAMES[Number(day)]}: ${message}`);
      }
    }
    setIsSaving(false);

    const added = values.days.length - problems.length;
    if (added) toast.success(`Added on ${added} day${added > 1 ? "s" : ""}.`);
    if (problems.length) {
      toast.error(problems.join("\n"), { duration: 8000 });
      form.setValue(
        "days",
        values.days.filter((day) => problems.some((p) => p.startsWith(DAY_NAMES[Number(day)])))
      );
      return;
    }
    onClose();
  });

  return { form, teacherOptions, subjectOptions, pickTeacher, submit, isSaving };
};

export default usePeriodDialogController;
