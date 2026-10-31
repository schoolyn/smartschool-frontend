import { useEffect, useMemo, useState } from "react";

import { useCurrentRole } from "@/entities/session";
import { useGetAcademicYears, useGetClasses, useGetSections, useGetMyTeacherAssignments } from "@/entities/academics";

// section pickers: admins see the whole school, teachers their own classes; picking a level clears those below
export const useSectionPicker = (organizationId: string, { includeInactive = false } = {}) => {
  const isTeacher = useCurrentRole() === "teacher";

  const [academicYearId, setYear] = useState("");
  const [classId, setClass] = useState("");
  const [sectionId, setSectionId] = useState("");

  const status = includeInactive ? undefined : "active";
  const years = useGetAcademicYears(organizationId);
  const classes = useGetClasses(organizationId, academicYearId, status);
  const sections = useGetSections(organizationId, classId, status);
  const mine = useGetMyTeacherAssignments(organizationId, isTeacher);

  const taught = useMemo(() => {
    const items = mine.data?.items ?? [];
    return {
      yearIds: new Set(items.map((a) => a.academicYearId?.id)),
      classIds: new Set(items.map((a) => a.classId?.id)),
      sectionIds: new Set(items.map((a) => a.sectionId?.id)),
    };
  }, [mine.data]);

  const yearOptions = (years.data?.items ?? []).filter((y) => !isTeacher || taught.yearIds.has(y.id));
  const classOptions = (classes.data?.items ?? []).filter((c) => !isTeacher || taught.classIds.has(c.id));
  const sectionOptions = (sections.data?.items ?? []).filter((s) => !isTeacher || taught.sectionIds.has(s.id));

  useEffect(() => {
    if (academicYearId || !yearOptions.length) return;
    setYear((yearOptions.find((y) => y.isCurrent) ?? yearOptions[0]).id);
  }, [academicYearId, yearOptions]);

  // a pick that is no longer offered (switched off, or carried over from a report of past classes) is cleared
  const optionsReady = !isTeacher || mine.isSuccess;
  const classGone = !!classId && classes.isSuccess && optionsReady && !classOptions.some((c) => c.id === classId);
  const sectionGone =
    !!sectionId && sections.isSuccess && optionsReady && !sectionOptions.some((s) => s.id === sectionId);
  useEffect(() => {
    if (classGone) setClass("");
    if (classGone || sectionGone) setSectionId("");
  }, [classGone, sectionGone]);

  const setAcademicYearId = (id: string) => {
    setYear(id);
    setClass("");
    setSectionId("");
  };
  const setClassId = (id: string) => {
    setClass(id);
    setSectionId("");
  };

  return {
    academicYears: yearOptions,
    classes: classOptions,
    sections: sectionOptions,
    academicYearId,
    setAcademicYearId,
    classId,
    setClassId,
    sectionId,
    setSectionId,
    isTeacher,
    // a teacher with no classes yet sees an explanation instead of empty pickers
    hasNoClasses: isTeacher && mine.isSuccess && (mine.data?.items.length ?? 0) === 0,
  };
};
