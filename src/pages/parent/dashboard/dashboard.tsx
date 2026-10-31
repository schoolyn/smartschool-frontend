import ErrorState from "@/shared/ui/error-state";
import SectionHeader from "@/shared/ui/section-header";
import Spinner from "@/shared/ui/spinner";
import EmptyState from "@/shared/ui/empty-state";
import useParentDashboardController from "./dashboard-controller";

const ParentDashboard = () => {
  const { cards, isLoading, error, retry, hasNoChildren } = useParentDashboardController();

  return (
    <div className="max-w-7xl mx-auto">
      <SectionHeader title="Dashboard" description="A quick overview of your child's school activity" />

      {error ? (
        <ErrorState error={error} onRetry={retry} />
      ) : isLoading ? (
        <Spinner />
      ) : hasNoChildren ? (
        <div className="rounded-xl bg-white shadow">
          <EmptyState
            title="No child linked yet"
            description="Ask the school office to link your child to this account. Homework, attendance, fees and results then appear here."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow p-6 flex items-center space-x-4">
                <div className="p-3 bg-primary-50 rounded-lg">
                  <Icon className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ParentDashboard;
