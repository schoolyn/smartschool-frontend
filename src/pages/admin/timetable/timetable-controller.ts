import { useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { useError } from "@/shared/lib/hooks";
import { ITimetableSlot } from "@/entities/timetable";
import { useGetSubjects, useGetTeacherAssignments } from "@/entities/academics";
import { useSectionPicker } from "@/features/section-picker";
import { useDeleteTimetableSlot, useGetTimetable } from "@/entities/timetable";

// admins build each section's week; a teacher sees their own week across every class they teach
const useTimetableController = () => {
  const { organizationId = "" } = useParams();
  const picker = useSectionPicker(organizationId);
  const { isTeacher, academicYearId, sectionId } = picker;
  const [isAdding, setIsAdding] = useState(false);
  const [toRemove, setToRemove] = useState<ITimetableSlot | null>(null);

  const timetable = useGetTimetable(organizationId, isTeacher ? "" : sectionId, isTeacher || !!sectionId);
  const assignments = useGetTeacherAssignments(organizationId, academicYearId, !isTeacher && !!academicYearId);
  const subjects = useGetSubjects(organizationId, isTeacher ? undefined : academicYearId, "active");
  const remove = useDeleteTimetableSlot(organizationId);
  useError({ mutation: remove });

  const sectionAssignments = (assignments.data?.items ?? []).filter(
    (a) => a.sectionId?.id === sectionId && a.status !== "inactive"
  );

  const confirmRemove = () =>
    toRemove &&
    remove.mutate(toRemove.id, {
      onSuccess: () => {
        toast.success("Period removed.");
        setToRemove(null);
      },
    });

  return {
    organizationId,
    picker,
    timetable,
    slots: timetable.data?.items ?? [],
    ready: isTeacher || !!sectionId,
    sectionAssignments,
    subjects: subjects.data?.items ?? [],
    isAdding,
    openAdd: () => setIsAdding(true),
    closeAdd: () => setIsAdding(false),
    toRemove,
    askRemove: isTeacher ? undefined : setToRemove,
    closeRemove: () => setToRemove(null),
    confirmRemove,
    isRemoving: remove.isPending,
  };
};

export default useTimetableController;
