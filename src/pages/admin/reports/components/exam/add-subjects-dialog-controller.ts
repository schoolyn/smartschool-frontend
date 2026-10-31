import { useEffect, useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { countLabel } from "@/shared/ui/data-table";
import { useError } from "@/shared/lib/hooks";
import { useGetSubjects } from "@/entities/academics";
import { SelectOption } from "@/shared/types";
import { defaultExamSubjectRow, examSubjectsSchema, ExamSubjectsFormValues } from "../../reports.schema";
import { useAddExamSubjects } from "@/entities/exam";

interface AddSubjectsDialogControllerArgs {
  organizationId: string;
  academicYearId: string;
  examId: string;
  classId: string;
  // subjects this class already has in the exam
  addedSubjectIds: string[];
  open: boolean;
  onClose: () => void;
}

const useAddSubjectsDialogController = ({
  organizationId,
  academicYearId,
  examId,
  classId,
  addedSubjectIds,
  open,
  onClose,
}: AddSubjectsDialogControllerArgs) => {
  const subjects = useGetSubjects(organizationId, academicYearId, "active");
  const addSubjects = useAddExamSubjects(organizationId);
  useError({ mutation: addSubjects });

  // the class's own subjects (none listed = every class), minus the ones already in the exam
  const available: SelectOption[] = useMemo(
    () =>
      (subjects.data?.items ?? [])
        .filter((subject) => !subject.applicableClassIds?.length || subject.applicableClassIds.includes(classId))
        .filter((subject) => !addedSubjectIds.includes(subject.id))
        .map((subject) => ({ id: subject.id, name: subject.name })),
    [subjects.data, classId, addedSubjectIds]
  );

  const form = useForm<ExamSubjectsFormValues>({
    resolver: zodResolver(examSubjectsSchema),
    defaultValues: { rows: [{ ...defaultExamSubjectRow }] },
  });
  const rows = useFieldArray({ control: form.control, name: "rows" });

  useEffect(() => {
    if (open) form.reset({ rows: [{ ...defaultExamSubjectRow }] });
  }, [open, form]);

  // every remaining subject at once, keeping the marks typed in the first row
  const addAll = () => {
    const [first] = form.getValues("rows");
    rows.replace(available.map((subject) => ({ ...defaultExamSubjectRow, ...first, subjectId: String(subject.id) })));
    // messages from an earlier try belong to rows that are gone now
    form.clearErrors();
  };

  const onSubmit = form.handleSubmit((values) => {
    const ids = values.rows.map((row) => row.subjectId);
    if (new Set(ids).size !== ids.length) {
      toast.error("Each subject can be added once.");
      return;
    }
    addSubjects.mutate(
      {
        examId,
        classId,
        subjects: values.rows.map((row) => ({
          subjectId: row.subjectId,
          maxMarks: Number(row.maxMarks),
          passMarks: Number(row.passMarks),
          hasPractical: row.hasPractical,
          practicalMaxMarks: row.hasPractical ? Number(row.practicalMaxMarks) : 0,
        })),
      },
      {
        onSuccess: () => {
          toast.success(`${countLabel(values.rows.length, { one: "subject", other: "subjects" })} added.`);
          onClose();
        },
      }
    );
  });

  return {
    form,
    rows,
    available,
    isLoadingSubjects: subjects.isLoading,
    addAll,
    addRow: () => rows.append({ ...defaultExamSubjectRow }),
    onSubmit,
    isSaving: addSubjects.isPending,
  };
};

export default useAddSubjectsDialogController;
