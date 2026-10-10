import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import SectionHeader from "@/components/section-header";
import { useGetAcademicYears, useGetClasses } from "./service/academics-service";
import AssignmentsTab from "./tabs/assignments-tab";
import ClassesTab from "./tabs/classes-tab";
import SectionsTab from "./tabs/sections-tab";
import SubjectsTab from "./tabs/subjects-tab";
import YearsTab from "./tabs/years-tab";

const TABS = [
  { key: "years", label: "Academic years" },
  { key: "classes", label: "Classes" },
  { key: "sections", label: "Sections" },
  { key: "subjects", label: "Subjects" },
  { key: "teachers", label: "Teacher assignments" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const AdminClasses = () => {
  const { organizationId = "" } = useParams();

  const [activeTab, setActiveTab] = useState<TabKey>("years");
  const [yearId, setYearId] = useState("");
  const [classId, setClassId] = useState("");

  const years = useGetAcademicYears(organizationId);
  const yearList = useMemo(() => years.data?.items ?? [], [years.data]);
  const classes = useGetClasses(organizationId, yearId, "active");

  // start on the current year (or the newest one) so every tab opens with something useful
  useEffect(() => {
    if (!yearId && yearList.length) setYearId((yearList.find((year) => year.isCurrent) ?? yearList[0]).id);
  }, [yearList, yearId]);

  // a class from another year cannot stay selected; fall back to the first class of the chosen year
  useEffect(() => {
    const firstClass = classes.data?.items[0];
    if (classes.data && !classes.data.items.some((klass) => klass.id === classId)) setClassId(firstClass?.id ?? "");
  }, [classes.data, classId]);

  const showSections = (id: string) => {
    setClassId(id);
    setActiveTab("sections");
  };

  return (
    <div className="mx-auto max-w-7xl">
      <SectionHeader
        title="Academics"
        description="Set up your school year: classes, sections, subjects and who teaches what"
      />

      <div className="mb-6 border-b border-gray-200">
        <nav className="flex gap-6 overflow-x-auto" aria-label="Academics sections">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              aria-current={activeTab === tab.key ? "page" : undefined}
              className={`whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium ${
                activeTab === tab.key
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "years" && <YearsTab organizationId={organizationId} />}
      {activeTab === "classes" && (
        <ClassesTab
          organizationId={organizationId}
          years={yearList}
          yearId={yearId}
          onYearChange={setYearId}
          onViewSections={showSections}
        />
      )}
      {activeTab === "sections" && (
        <SectionsTab organizationId={organizationId} yearId={yearId} classId={classId} onClassChange={setClassId} />
      )}
      {activeTab === "subjects" && (
        <SubjectsTab organizationId={organizationId} years={yearList} yearId={yearId} onYearChange={setYearId} />
      )}
      {activeTab === "teachers" && <AssignmentsTab organizationId={organizationId} yearId={yearId} />}
    </div>
  );
};

export default AdminClasses;
