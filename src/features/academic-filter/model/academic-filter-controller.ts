import { useEffect, useMemo } from "react";

import { useGetAcademicYears, useGetClasses, useGetSections } from "@/entities/academics";
import { SelectOption } from "@/shared/types";

export interface AcademicFilterValue {
  academicYearId: string;
  classId: string;
  sectionId: string;
}

// the select can't hold an empty value, so "All" is a sentinel that means no filter
export const ALL = "all";
export const fromOption = (id: string | number) => (String(id) === ALL ? "" : String(id));

const toOption = (item: { id: string; name: string }): SelectOption => ({ id: item.id, name: item.name });
const selected = (options: SelectOption[], id: string) => options.find((o) => String(o.id) === id) ?? null;

// picks the current year first; classes and sections follow the year and class chosen
const useAcademicFilterController = (
  organizationId: string,
  value: AcademicFilterValue,
  onChange: (value: AcademicFilterValue) => void
) => {
  const years = useGetAcademicYears(organizationId);
  const classes = useGetClasses(organizationId, value.academicYearId || undefined, "active");
  const sections = useGetSections(organizationId, value.classId || undefined, "active");

  const yearItems = useMemo(() => years.data?.items ?? [], [years.data]);
  useEffect(() => {
    if (value.academicYearId || !yearItems.length) return;
    const current = yearItems.find((year) => year.isCurrent) ?? yearItems[0];
    onChange({ academicYearId: current.id, classId: "", sectionId: "" });
  }, [yearItems, value.academicYearId, onChange]);

  const yearOptions = yearItems.map(toOption);
  const classOptions = [{ id: ALL, name: "All classes" }, ...(classes.data?.items ?? []).map(toOption)];
  const sectionOptions = [{ id: ALL, name: "All sections" }, ...(sections.data?.items ?? []).map(toOption)];

  return { yearOptions, classOptions, sectionOptions, selected };
};

export default useAcademicFilterController;
