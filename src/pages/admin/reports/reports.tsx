import { AdjustmentsHorizontalIcon, ClipboardDocumentListIcon, PencilSquareIcon } from "@heroicons/react/24/outline";

import PageTabs, { PageTab } from "@/shared/ui/page-tabs";
import SectionHeader, { HeaderActionsProvider } from "@/shared/ui/section-header";
import ExamsTab from "./tabs/exams-tab";
import GradingSchemesTab from "./tabs/grading-schemes-tab";
import MarksEntryTab from "./tabs/marks-entry-tab";
import useReportsController, { ReportsTabKey } from "./reports-controller";

const AdminReports = () => {
  const { organizationId, activeTab, setActiveTab, currentYearId, classOptions } = useReportsController();

  const TABS: PageTab<ReportsTabKey>[] = [
    {
      key: "exams",
      label: "Exams",
      icon: ClipboardDocumentListIcon,
      render: () => (
        <ExamsTab organizationId={organizationId} academicYearId={currentYearId} classOptions={classOptions} />
      ),
    },
    {
      key: "marks",
      label: "Marks Entry",
      icon: PencilSquareIcon,
      render: () => <MarksEntryTab organizationId={organizationId} />,
    },
    {
      key: "schemes",
      label: "Grading Schemes",
      icon: AdjustmentsHorizontalIcon,
      render: () => <GradingSchemesTab organizationId={organizationId} />,
    },
  ];

  return (
    <HeaderActionsProvider>
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          title="Examinations"
          description="Create exams, enter and verify marks, and publish results to parents"
        />
        <PageTabs tabs={TABS} value={activeTab} onChange={setActiveTab} label="Exams sections" />
      </div>
    </HeaderActionsProvider>
  );
};

export default AdminReports;
