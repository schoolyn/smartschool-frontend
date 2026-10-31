import { useState } from "react";
import { useParams } from "react-router-dom";

import { useGetExams, useGetExamSubjects } from "@/entities/exam";
import { useGetMyTeacherAssignments } from "@/entities/academics";
import { SelectOption } from "@/shared/types";

// mirrors backend assertCanEnterMarks: a class teacher may enter any subject, a subject teacher only theirs
const useTeacherMarksController = () => {
  const { organizationId = "" } = useParams();

  const [examId, setExamId] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [examSubjectId, setExamSubjectId] = useState("");

  const exams = useGetExams(organizationId);
  const assignments = useGetMyTeacherAssignments(organizationId);
  const examSubjects = useGetExamSubjects(organizationId, examId, classId);

  const myAssignments = assignments.data?.items ?? [];
  const classIdsTaught = new Set(myAssignments.map((a) => a.classId.id));
  const exam = exams.data?.items.find((e) => e.id === examId);

  // only exams that include a class the teacher is assigned to
  const examOptions: SelectOption[] = (exams.data?.items ?? [])
    .filter((e) => e.classIds.some((k) => classIdsTaught.has(k.id)))
    .map((e) => ({ id: e.id, name: e.name }));

  const classOptions: SelectOption[] = (exam?.classIds ?? [])
    .filter((k) => classIdsTaught.has(k.id))
    .map((k) => ({ id: k.id, name: k.name }));

  // the sections of this class the teacher has any assignment in
  const sectionOptions: SelectOption[] = [
    ...new Map(
      myAssignments
        .filter((a) => a.classId.id === classId)
        .map((a) => [a.sectionId.id, { id: a.sectionId.id, name: a.sectionId.name }])
    ).values(),
  ];

  const isClassTeacherHere = myAssignments.some(
    (a) => a.classId.id === classId && a.sectionId.id === sectionId && a.assignmentRole === "CLASS_TEACHER"
  );
  const subjectIdsTaughtHere = new Set(
    myAssignments
      .filter((a) => a.classId.id === classId && a.sectionId.id === sectionId && a.subjectId)
      .map((a) => a.subjectId!.id)
  );
  const subjectOptions: SelectOption[] = (examSubjects.data?.items ?? [])
    .filter(
      (es) => isClassTeacherHere || (typeof es.subjectId === "object" && subjectIdsTaughtHere.has(es.subjectId.id))
    )
    .map((es) => ({ id: es.id, name: typeof es.subjectId === "object" ? es.subjectId.name : "" }));

  const onExamChange = (id: string) => {
    setExamId(id);
    setClassId("");
    setSectionId("");
    setExamSubjectId("");
  };
  const onClassChange = (id: string) => {
    setClassId(id);
    setSectionId("");
    setExamSubjectId("");
  };
  const onSectionChange = (id: string) => {
    setSectionId(id);
    setExamSubjectId("");
  };

  return {
    isLoading: exams.isLoading || assignments.isLoading,
    examId,
    classId,
    sectionId,
    examSubjectId,
    examOptions,
    classOptions,
    sectionOptions,
    subjectOptions,
    onExamChange,
    onClassChange,
    onSectionChange,
    setExamSubjectId,
    examPublished: exam?.status === "published",
  };
};

export default useTeacherMarksController;
