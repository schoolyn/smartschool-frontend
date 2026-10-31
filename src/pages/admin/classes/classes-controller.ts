import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { useTabParam } from "@/shared/lib/hooks";
import { useGetAcademicYears, useGetClasses } from "@/entities/academics";

const CLASSES_TABS = ["years", "classes", "sections", "subjects", "teachers"] as const;
export type ClassesTabKey = (typeof CLASSES_TABS)[number];

const useClassesController = () => {
  const { organizationId = "" } = useParams();

  const [activeTab, setActiveTab] = useTabParam(CLASSES_TABS, "classes");
  const [yearId, setYearId] = useState("");
  const [classId, setClassId] = useState("");

  const years = useGetAcademicYears(organizationId);
  const yearList = useMemo(() => years.data?.items ?? [], [years.data]);
  // inactive classes too, so "View sections" works on them (same query the sections tab uses)
  const classes = useGetClasses(organizationId, yearId);

  // start on the current year (or the newest one) so every tab opens with something useful
  useEffect(() => {
    if (!yearId && yearList.length) setYearId((yearList.find((year) => year.isCurrent) ?? yearList[0]).id);
  }, [yearList, yearId]);

  // a class from another year cannot stay selected; fall back to the first active class of the chosen year
  useEffect(() => {
    const firstClass = classes.data?.items.find((klass) => klass.status === "active");
    if (classes.data && !classes.data.items.some((klass) => klass.id === classId)) setClassId(firstClass?.id ?? "");
  }, [classes.data, classId]);

  const showSections = (id: string) => {
    setClassId(id);
    setActiveTab("sections");
  };

  return {
    organizationId,
    activeTab,
    setActiveTab,
    yearList,
    yearId,
    setYearId,
    classId,
    setClassId,
    showSections,
  };
};

export default useClassesController;
