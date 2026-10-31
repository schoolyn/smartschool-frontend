import { useState } from "react";
import { PlusIcon } from "@heroicons/react/20/solid";
import toast from "react-hot-toast";

import { useHeaderActions } from "@/shared/ui/section-header";
import { useError } from "@/shared/lib/hooks";
import { IExam } from "@/entities/exam";
import { useDeleteExam, useGetExams, useGetGradingSchemes } from "@/entities/exam";

const useExamListController = (organizationId: string) => {
  const exams = useGetExams(organizationId);
  const gradingSchemes = useGetGradingSchemes(organizationId);
  const deleteExam = useDeleteExam(organizationId);
  useError({ mutation: deleteExam });

  // undefined = closed, null = creating, an exam = editing it
  const [editing, setEditing] = useState<IExam | null | undefined>(undefined);
  const [toDelete, setToDelete] = useState<IExam | null>(null);

  useHeaderActions({ action: { label: "Create exam", icon: PlusIcon, onClick: () => setEditing(null) } });

  const confirmDelete = () =>
    toDelete &&
    deleteExam.mutate(toDelete.id, {
      onSuccess: () => {
        toast.success("Exam deleted.");
        setToDelete(null);
      },
    });

  return {
    items: exams.data?.items ?? [],
    isLoading: exams.isLoading,
    error: exams.isError ? exams.error : null,
    retry: () => exams.refetch(),
    gradingSchemes: gradingSchemes.data?.items ?? [],
    hasSchemes: !gradingSchemes.isLoading && (gradingSchemes.data?.items.length ?? 0) > 0,
    editing,
    openCreate: () => setEditing(null),
    openEdit: (exam: IExam) => setEditing(exam),
    closeForm: () => setEditing(undefined),
    toDelete,
    askDelete: setToDelete,
    cancelDelete: () => setToDelete(null),
    confirmDelete,
    isDeleting: deleteExam.isPending,
  };
};

export default useExamListController;
