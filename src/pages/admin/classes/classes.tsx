import {
  BookOpenIcon,
  CalendarDaysIcon,
  RectangleGroupIcon,
  Squares2X2Icon,
  UserIcon,
} from "@heroicons/react/24/outline";

import PageTabs, { PageTab } from "@/shared/ui/page-tabs";
import SectionHeader, { HeaderActionsProvider } from "@/shared/ui/section-header";
import AssignmentsTab from "./tabs/assignments-tab";
import ClassesTab from "./tabs/classes-tab";
import SectionsTab from "./tabs/sections-tab";
import SubjectsTab from "./tabs/subjects-tab";
import YearsTab from "./tabs/years-tab";
import useClassesController, { ClassesTabKey } from "./classes-controller";

const AdminClasses = () => {
  const { organizationId, activeTab, setActiveTab, yearList, yearId, setYearId, classId, setClassId, showSections } =
    useClassesController();

  const TABS: PageTab<ClassesTabKey>[] = [
    {
      key: "years",
      label: "Academic years",
      icon: CalendarDaysIcon,
      render: () => <YearsTab organizationId={organizationId} />,
    },
    {
      key: "classes",
      label: "Classes",
      icon: Squares2X2Icon,
      render: () => (
        <ClassesTab
          organizationId={organizationId}
          years={yearList}
          yearId={yearId}
          onYearChange={setYearId}
          onViewSections={showSections}
        />
      ),
    },
    {
      key: "sections",
      label: "Sections",
      icon: RectangleGroupIcon,
      render: () => (
        <SectionsTab organizationId={organizationId} yearId={yearId} classId={classId} onClassChange={setClassId} />
      ),
    },
    {
      key: "subjects",
      label: "Subjects",
      icon: BookOpenIcon,
      render: () => (
        <SubjectsTab organizationId={organizationId} years={yearList} yearId={yearId} onYearChange={setYearId} />
      ),
    },
    {
      key: "teachers",
      label: "Assignments",
      icon: UserIcon,
      render: () => <AssignmentsTab organizationId={organizationId} yearId={yearId} />,
    },
  ];

  return (
    <HeaderActionsProvider>
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          title="Academics"
          description="Set up your school year: classes, sections, subjects and who teaches what"
        />
        <PageTabs tabs={TABS} value={activeTab} onChange={setActiveTab} label="Academics sections" />
      </div>
    </HeaderActionsProvider>
  );
};

export default AdminClasses;
