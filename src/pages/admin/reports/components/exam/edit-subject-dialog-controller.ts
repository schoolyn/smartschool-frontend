import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { useError } from "@/shared/lib/hooks";
import { IExamOverviewSubject, useUpdateExamSubject } from "@/entities/exam";
import { subjectMarksSchema, SubjectMarksFormValues } from "../../reports.schema";

const useEditSubjectDialogController = (
  organizationId: string,
  subject: IExamOverviewSubject | null,
  onClose: () => void
) => {
  const updateSubject = useUpdateExamSubject(organizationId);
  useError({ mutation: updateSubject });
  const form = useForm<SubjectMarksFormValues>({ resolver: zodResolver(subjectMarksSchema) });

  useEffect(() => {
    if (subject) {
      form.reset({
        maxMarks: String(subject.maxMarks),
        passMarks: String(subject.passMarks),
        hasPractical: subject.hasPractical,
        practicalMaxMarks: subject.hasPractical ? String(subject.practicalMaxMarks) : "",
      });
    }
  }, [subject, form]);

  const onSubmit = form.handleSubmit((values) => {
    if (!subject) return;
    updateSubject.mutate(
      {
        examSubjectId: subject.id,
        maxMarks: Number(values.maxMarks),
        passMarks: Number(values.passMarks),
        hasPractical: values.hasPractical,
        practicalMaxMarks: values.hasPractical ? Number(values.practicalMaxMarks) : 0,
      },
      {
        onSuccess: () => {
          toast.success("Subject updated.");
          onClose();
        },
      }
    );
  });

  return { form, onSubmit, isSaving: updateSubject.isPending };
};

export default useEditSubjectDialogController;
