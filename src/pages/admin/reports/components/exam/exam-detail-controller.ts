import { useState } from "react";
import toast from "react-hot-toast";

import { useError } from "@/shared/lib/hooks";
import { useGetClasses } from "@/entities/academics";
import { IExamOverviewSubject } from "@/entities/exam";
import {
  useDeleteExam,
  useDeleteExamSubject,
  useGetExamOverview,
  useGetGradingSchemes,
  usePublishExam,
} from "@/entities/exam";

// what still stands between this exam and publishing, in the admin's words
const readinessOf = (
  classes: { name: string; subjects: IExamOverviewSubject[] }[],
  progress?: { expected: number; entered: number; verified: number; stage: string }
) => {
  if (!progress) return "";
  if (progress.stage === "published") return "Results are published. Parents can see them, and marks are locked.";
  const bare = classes.filter((klass) => !klass.subjects.length).map((klass) => klass.name);
  if (bare.length) return `Add subjects for ${bare.join(", ")} to start entering marks.`;
  const toEnter = Math.max(0, progress.expected - progress.entered);
  const toVerify = progress.entered - progress.verified;
  if (!toEnter && !toVerify) return `All ${progress.expected} marks are entered and verified. Ready to publish.`;
  const left = [toEnter && `${toEnter} marks still to enter`, toVerify && `${toVerify} to verify`].filter(Boolean);
  return `${left.join(", ")}. A student who missed a paper is marked Absent in Marks Entry.`;
};

const useExamDetailController = (organizationId: string, examId: string, onDeleted: () => void) => {
  const overview = useGetExamOverview(organizationId, examId);
  const gradingSchemes = useGetGradingSchemes(organizationId);
  const publishExam = usePublishExam(organizationId);
  const deleteExam = useDeleteExam(organizationId);
  const deleteSubject = useDeleteExamSubject(organizationId);
  useError({ mutation: publishExam });
  useError({ mutation: deleteExam });
  useError({ mutation: deleteSubject });

  const exam = overview.data?.item;
  // an exam's classes can only come from its own academic year
  const yearClasses = useGetClasses(organizationId, exam?.academicYearId);
  const classes = overview.data?.classes ?? [];
  const progress = exam?.progress;
  const isPublished = progress?.stage === "published";

  const [classId, setClassId] = useState("");
  const selected = classes.find((klass) => klass.id === classId) ?? classes[0];

  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingSubject, setEditingSubject] = useState<IExamOverviewSubject | null>(null);
  const [removingSubject, setRemovingSubject] = useState<IExamOverviewSubject | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // a missing mark would count as absent with 0 marks, so publishing waits for every mark, entered and verified
  const canPublish = progress?.stage === "ready";

  const confirmPublish = () =>
    publishExam.mutate(examId, {
      onSuccess: () => {
        toast.success("Results published. Parents can see them now.");
        setIsPublishing(false);
      },
    });

  const confirmDelete = () =>
    deleteExam.mutate(examId, {
      onSuccess: () => {
        toast.success("Exam deleted.");
        setIsDeleting(false);
        onDeleted();
      },
    });

  const confirmRemoveSubject = () =>
    removingSubject &&
    deleteSubject.mutate(removingSubject.id, {
      onSuccess: () => {
        toast.success("Subject removed.");
        setRemovingSubject(null);
      },
    });

  return {
    exam,
    classes,
    progress,
    isLoading: overview.isLoading,
    error: overview.isError ? overview.error : null,
    retry: () => overview.refetch(),
    gradingSchemes: gradingSchemes.data?.items ?? [],
    classOptions: (yearClasses.data?.items ?? []).map((klass) => ({ id: klass.id, name: klass.name })),
    isPublished,
    readiness: readinessOf(classes, progress),
    selected,
    selectClass: setClassId,
    canPublish,
    isEditing,
    setIsEditing,
    isAdding,
    setIsAdding,
    editingSubject,
    setEditingSubject,
    removingSubject,
    setRemovingSubject,
    confirmRemoveSubject,
    isRemovingSubject: deleteSubject.isPending,
    isDeleting,
    setIsDeleting,
    confirmDelete,
    isDeletingExam: deleteExam.isPending,
    isPublishing,
    setIsPublishing,
    confirmPublish,
    isPublishPending: publishExam.isPending,
  };
};

export default useExamDetailController;
