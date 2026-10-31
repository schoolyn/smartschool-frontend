import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import { SelectOption } from "@/shared/types";
import { useGetSections } from "@/entities/academics";
import { useGetExams, useGetExamSubjects } from "@/entities/exam";

const useMarksEntryTabController = (organizationId: string) => {
  // the picks live in the address, so a refresh, Back or a link from an exam's page opens the same sheet
  const [params, setParams] = useSearchParams();
  const examId = params.get("exam") ?? "";
  const classId = params.get("class") ?? "";
  const sectionId = params.get("section") ?? "";
  const examSubjectId = params.get("subject") ?? "";
  const pick = (next: Record<string, string>) =>
    setParams(Object.fromEntries(Object.entries({ tab: "marks", ...next }).filter(([, value]) => value)), {
      replace: true,
    });

  const exams = useGetExams(organizationId);
  const sections = useGetSections(organizationId, classId);
  const examSubjectsForMarks = useGetExamSubjects(organizationId, examId, classId);

  // a class with sections opens on its first one, so the sheet shows without another pick
  const firstSectionId = sections.data?.items[0]?.id;
  useEffect(() => {
    if (classId && !sectionId && firstSectionId) {
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          next.set("section", firstSectionId);
          return next;
        },
        { replace: true }
      );
    }
  }, [classId, sectionId, firstSectionId, setParams]);

  const exam = exams.data?.items.find((e) => e.id === examId);

  const examOptions: SelectOption[] = (exams.data?.items ?? []).map((e) => ({ id: e.id, name: e.name }));
  const classOptions: SelectOption[] = (exam?.classIds ?? []).map((k) => ({ id: k.id, name: k.name }));
  const sectionOptions: SelectOption[] = (sections.data?.items ?? []).map((s) => ({ id: s.id, name: s.name }));
  const subjectOptions: SelectOption[] = (examSubjectsForMarks.data?.items ?? []).map((es) => ({
    id: es.id,
    name: typeof es.subjectId === "object" ? es.subjectId.name : "",
  }));

  // picking an exam or class clears everything chosen below it
  const selectExam = (id: string) => pick({ exam: id });
  const selectClass = (id: string) => pick({ exam: examId, class: id });
  const selectSection = (id: string) => pick({ exam: examId, class: classId, section: id, subject: examSubjectId });
  const selectSubject = (id: string) => pick({ exam: examId, class: classId, section: sectionId, subject: id });

  return {
    examId,
    classId,
    sectionId,
    examSubjectId,
    examOptions,
    classOptions,
    sectionOptions,
    subjectOptions,
    selectExam,
    selectClass,
    selectSection,
    selectSubject,
    isSheetReady: !!(sectionId && examSubjectId),
    examPublished: exam?.status === "published",
  };
};

export default useMarksEntryTabController;
