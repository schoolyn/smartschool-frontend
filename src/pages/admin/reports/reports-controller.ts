import { useParams } from "react-router-dom";

import { useTabParam } from "@/shared/lib/hooks";
import { useGetAcademicYears, useGetClasses } from "@/entities/academics";

const REPORTS_TABS = ["exams", "marks", "schemes"] as const;
export type ReportsTabKey = (typeof REPORTS_TABS)[number];

const useReportsController = () => {
  const { organizationId = "" } = useParams();
  const [activeTab, setActiveTab] = useTabParam(REPORTS_TABS, "exams");

  const years = useGetAcademicYears(organizationId);
  const currentYearId = years.data?.items.find((year) => year.isCurrent)?.id;
  const classes = useGetClasses(organizationId, currentYearId);

  return {
    organizationId,
    activeTab,
    setActiveTab,
    currentYearId,
    classOptions: (classes.data?.items ?? []).map((klass) => ({ id: klass.id, name: klass.name })),
  };
};

export default useReportsController;
