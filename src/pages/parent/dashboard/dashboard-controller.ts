import { useParams } from "react-router-dom";
import { UserGroupIcon, BookOpenIcon, CurrencyDollarIcon, BellIcon } from "@heroicons/react/24/outline";

import { useHasModule } from "@/entities/session";
import { ModuleKey } from "@/shared/types";
import { formatMoney } from "@/shared/lib";
import { useGetParentDashboard } from "@/entities/dashboard";

const useParentDashboardController = () => {
  const { organizationId } = useParams();
  const { data, isLoading, isError, error, refetch } = useGetParentDashboard(organizationId || "");
  const hasModule = useHasModule();

  const cards = [
    { title: "My Children", value: data?.childrenCount ?? "-", icon: UserGroupIcon },
    { title: "Upcoming Homework", value: data?.upcomingHomeworkCount ?? "-", icon: BookOpenIcon, module: "homework" },
    {
      title: "Pending Fees",
      value: data ? formatMoney(data.pendingFeesTotal) : "-",
      icon: CurrencyDollarIcon,
      module: "fees",
    },
    { title: "Active Notices", value: data?.recentNoticesCount ?? "-", icon: BellIcon, module: "notices" },
    // a module the school doesn't have isn't shown to parents at all
  ].filter((card) => !card.module || hasModule(card.module as ModuleKey));

  return {
    cards,
    isLoading,
    error: isError ? error : null,
    retry: () => refetch(),
    hasNoChildren: !!data && data.childrenCount === 0,
  };
};

export default useParentDashboardController;
