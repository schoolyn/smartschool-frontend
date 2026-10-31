import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { useError } from "@/shared/lib/hooks";
import { IExam, IGradingScheme } from "@/entities/exam";
import { SelectOption } from "@/shared/types";
import { defaultExamValues, examSchema, ExamFormValues } from "../../reports.schema";
import { useCreateExam, useUpdateExam } from "@/entities/exam";

interface ExamFormDialogControllerArgs {
  organizationId: string;
  academicYearId?: string;
  gradingSchemes: IGradingScheme[];
  // set to edit that exam; left out to create one
  exam?: IExam;
  open: boolean;
  onClose: () => void;
  onCreated?: (examId: string) => void;
}

const valuesOf = (exam: IExam): ExamFormValues => ({
  name: exam.name,
  term: exam.term ?? "",
  type: exam.type,
  startDate: exam.startDate.slice(0, 10),
  endDate: exam.endDate.slice(0, 10),
  classIds: exam.classIds.map((klass) => klass.id),
  gradingSchemeId: typeof exam.gradingSchemeId === "object" ? exam.gradingSchemeId.id : exam.gradingSchemeId,
});

const useExamFormDialogController = ({
  organizationId,
  academicYearId,
  gradingSchemes,
  exam,
  open,
  onClose,
  onCreated,
}: ExamFormDialogControllerArgs) => {
  const createExam = useCreateExam(organizationId);
  const updateExam = useUpdateExam(organizationId);
  useError({ mutation: createExam });
  useError({ mutation: updateExam });

  const form = useForm<ExamFormValues>({ resolver: zodResolver(examSchema), defaultValues: defaultExamValues });

  useEffect(() => {
    if (open) form.reset(exam ? valuesOf(exam) : defaultExamValues);
  }, [open, exam, form]);

  const onSubmit = form.handleSubmit((values) => {
    if (exam) {
      updateExam.mutate(
        { examId: exam.id, ...values },
        {
          onSuccess: () => {
            toast.success("Exam updated.");
            onClose();
          },
        }
      );
      return;
    }
    if (!academicYearId) {
      toast.error("Set a current academic year first (Settings, Academic Years).");
      return;
    }
    createExam.mutate(
      { ...values, academicYearId },
      {
        onSuccess: (created) => {
          toast.success("Exam created. Add its subjects next.");
          onClose();
          if (created?.id) onCreated?.(created.id);
        },
      }
    );
  });

  const gradingSchemeOptions: SelectOption[] = gradingSchemes.map((scheme) => ({ id: scheme.id, name: scheme.name }));

  return {
    form,
    onSubmit,
    isEdit: !!exam,
    isSubmitting: createExam.isPending || updateExam.isPending,
    gradingSchemeOptions,
    hasSchemes: gradingSchemes.length > 0,
  };
};

export default useExamFormDialogController;
