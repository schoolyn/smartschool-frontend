import { useEffect } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { useError } from "@/shared/lib/hooks";
import { exportToCsv } from "@/shared/lib";
import { marksSheetSchema, MarksSheetFormValues } from "./marks-entry.schema";
import { useGetMarksSheet, useSaveMarks, useVerifyExamSubjectMarks } from "@/entities/exam";

const useMarksSheetCardController = (organizationId: string, examSubjectId: string, sectionId: string) => {
  const marksSheet = useGetMarksSheet(organizationId, examSubjectId, sectionId);
  const saveMarks = useSaveMarks(organizationId);
  const verifyMarks = useVerifyExamSubjectMarks(organizationId);
  useError({ mutation: saveMarks });
  useError({ mutation: verifyMarks });

  const form = useForm<MarksSheetFormValues>({ resolver: zodResolver(marksSheetSchema), defaultValues: { rows: [] } });
  const rows = useFieldArray({ control: form.control, name: "rows" });
  const draftRows = useWatch({ control: form.control, name: "rows" });

  // the server sheet replaces the draft whenever the selection changes or a save/verify refetches it
  useEffect(() => {
    if (!marksSheet.data) return;
    rows.replace(
      marksSheet.data.items.map((item) => ({
        studentId: item.student.id,
        theoryMarks: String(item.marks?.theoryMarks ?? ""),
        practicalMarks: marksSheet.data.examSubject?.hasPractical ? String(item.marks?.practicalMarks ?? "") : "",
        isAbsent: item.marks?.isAbsent ?? false,
      }))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marksSheet.data]);

  const examSubject = marksSheet.data?.examSubject;
  const marksByStudent = Object.fromEntries((marksSheet.data?.items ?? []).map((item) => [item.student.id, item]));

  const unsavedCount = draftRows.filter((row) => {
    const item = marksByStudent[row.studentId];
    return (
      row.isAbsent !== (item?.marks?.isAbsent ?? false) ||
      row.theoryMarks !== String(item?.marks?.theoryMarks ?? "") ||
      row.practicalMarks !== String(item?.marks?.practicalMarks ?? "")
    );
  }).length;
  const hasUnsavedMarks = unsavedCount > 0;

  // empty rows are skipped, not saved as 0; marks above the maximum are caught before the server refuses
  const onSave = form.handleSubmit((values) => {
    const practicalMax = examSubject?.hasPractical ? examSubject.practicalMaxMarks : 0;
    const problems: string[] = [];
    const entries = values.rows.flatMap((row) => {
      const student = marksByStudent[row.studentId]?.student;
      if (row.isAbsent) return [{ studentId: row.studentId, isAbsent: true }];
      if (row.theoryMarks.trim() === "" && row.practicalMarks.trim() === "") return [];

      const theory = Number(row.theoryMarks || 0);
      const practical = Number(row.practicalMarks || 0);
      if (!Number.isFinite(theory) || theory < 0 || (examSubject && theory > examSubject.maxMarks)) {
        problems.push(`${student?.name}: theory marks must be between 0 and ${examSubject?.maxMarks}.`);
      }
      if (!Number.isFinite(practical) || practical < 0 || practical > practicalMax) {
        problems.push(`${student?.name}: practical marks must be between 0 and ${practicalMax}.`);
      }
      return [{ studentId: row.studentId, theoryMarks: theory, practicalMarks: practical, isAbsent: false }];
    });

    if (problems.length) {
      toast.error(problems.slice(0, 3).join(" ") + (problems.length > 3 ? ` (and ${problems.length - 3} more)` : ""));
      return;
    }
    if (!entries.length) {
      toast.error("Enter marks for at least one student, or mark them absent.");
      return;
    }
    saveMarks.mutate({ examSubjectId, sectionId, entries }, { onSuccess: () => toast.success("Marks saved.") });
  });

  // verifying applies to what is saved, so unsaved edits must be saved first rather than silently dropped
  const onVerify = () => {
    if (hasUnsavedMarks) {
      toast.error("Save the marks first, then verify them.");
      return;
    }
    verifyMarks.mutate(examSubjectId, { onSuccess: () => toast.success("Marks verified.") });
  };

  const onExport = () =>
    exportToCsv(
      "marks-sheet",
      draftRows.map((row) => {
        const student = marksByStudent[row.studentId]?.student;
        return {
          student: student?.name ?? "",
          roll_number: student?.rollNumber ?? "",
          theory_marks: row.isAbsent ? "" : row.theoryMarks,
          practical_marks: row.isAbsent ? "" : row.practicalMarks,
          absent: row.isAbsent ? "Yes" : "No",
          status: marksByStudent[row.studentId]?.marks?.status ?? "",
        };
      })
    );

  return {
    form,
    rows: rows.fields,
    draftRows,
    examSubject,
    marksByStudent,
    hasUnsavedMarks,
    unsavedCount,
    isLoading: marksSheet.isLoading,
    error: marksSheet.isError ? marksSheet.error : null,
    retry: () => marksSheet.refetch(),
    isSaving: saveMarks.isPending,
    isVerifying: verifyMarks.isPending,
    onSave,
    onVerify,
    onExport,
  };
};

export default useMarksSheetCardController;
