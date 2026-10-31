import { useParams } from "react-router-dom";
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ReceiptPercentIcon,
  TagIcon,
} from "@heroicons/react/24/outline";

import PageTabs, { PageTab } from "@/shared/ui/page-tabs";
import SectionHeader from "@/shared/ui/section-header";
import { useCan } from "@/entities/session";
import { useTabParam } from "@/shared/lib/hooks";
import { PermissionKey } from "@/shared/types";
import FeeHeadsTab from "./tabs/fee-heads-tab";
import FeeStructuresTab from "./tabs/fee-structures-tab";
import LedgerTab from "./tabs/ledger-tab";
import StudentFeesTab from "./tabs/student-fees-tab";
import DefaultersTab from "./tabs/defaulters-tab";
import CollectionsTab from "./tabs/collections-tab";

type FeesTab = PageTab & { anyOf: PermissionKey[] };

const AdminFees = () => {
  const { organizationId = "" } = useParams();
  const can = useCan();

  const TABS: FeesTab[] = [
    {
      key: "structures",
      label: "Fee Structures",
      icon: DocumentTextIcon,
      anyOf: ["fees.setup"],
      render: () => <FeeStructuresTab organizationId={organizationId} />,
    },
    {
      key: "heads",
      label: "Fee Heads",
      icon: TagIcon,
      anyOf: ["fees.setup"],
      render: () => <FeeHeadsTab organizationId={organizationId} />,
    },
    {
      key: "students",
      label: "Student Fees & Payments",
      icon: CurrencyDollarIcon,
      anyOf: ["fees.collect", "fees.reverse", "fees.concession"],
      render: () => <StudentFeesTab organizationId={organizationId} />,
    },
    {
      key: "ledger",
      label: "Payment Ledger",
      icon: ReceiptPercentIcon,
      anyOf: ["fees.collect", "fees.reports"],
      render: () => <LedgerTab organizationId={organizationId} />,
    },
    {
      key: "defaulters",
      label: "Defaulters",
      icon: ExclamationTriangleIcon,
      anyOf: ["fees.reports"],
      render: () => <DefaultersTab organizationId={organizationId} />,
    },
    {
      key: "collections",
      label: "Collections",
      icon: ChartBarIcon,
      anyOf: ["fees.reports"],
      render: () => <CollectionsTab organizationId={organizationId} />,
    },
  ];
  const tabs = TABS.filter((tab) => can(...tab.anyOf));
  const [activeTab, setActiveTab] = useTabParam(
    tabs.map((tab) => tab.key),
    tabs[0]?.key ?? ""
  );

  return (
    <div className="mx-auto max-w-7xl">
      <SectionHeader title="Fees" description="Fee setup, collection and reports" />
      <PageTabs tabs={tabs} value={activeTab} onChange={setActiveTab} label="Fees sections" />
    </div>
  );
};

export default AdminFees;
