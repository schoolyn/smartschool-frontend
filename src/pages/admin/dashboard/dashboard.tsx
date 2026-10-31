import ErrorState from "@/shared/ui/error-state";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
// screen readers can describe the charts
import "highcharts/modules/accessibility";
import { Link } from "react-router-dom";
import { BellIcon } from "@heroicons/react/24/outline";

import { NoticeModalWrapper as NoticeModal } from "@/features/notice-modal";
import SectionHeader from "@/shared/ui/section-header";
import { useDashboardController } from "./dashboard-controller";
import { UserTypeSelectionModal } from "@/features/user-type-selection-modal";
import StatCard from "./stat-card";
import ChartEmptyState from "./chart-empty-state";
import { ChartSkeleton, StatCardSkeleton, UpdatesSkeleton } from "./dashboard-skeletons";

const Dashboard = () => {
  const {
    t,
    statCards,
    quickActions,
    recentUpdates,
    studentPerformanceOptions,
    teacherStudentRatioOptions,
    monthlyAttendanceOptions,
    showAttendanceChart,
    showNotices,
    hasTeacherStudentData,
    isStatsLoading,
    statsError,
    retryStats,
    isNoticesLoading,
    isChartsLoading,
    greetingTitle,
    todayLabel,
    noticesPath,
    isNoticeModalOpen,
    isUserTypeModalOpen,
    openNoticeModal,
    closeNoticeModal,
    handleCreateNotice,
    isCreatingNotice,
    isSuccessNoticeCreation,
    closeUserTypeModal,
    handleSelectStudent,
    handleSelectTeacher,
  } = useDashboardController();

  const chartCard = (
    options: typeof studentPerformanceOptions | typeof teacherStudentRatioOptions | typeof monthlyAttendanceOptions
  ) => (
    <div className="flex h-full flex-col justify-center bg-white rounded-xl shadow-xl p-6">
      {isChartsLoading ? <ChartSkeleton /> : <HighchartsReact highcharts={Highcharts} options={options} />}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 min-h-screen">
      <SectionHeader title={greetingTitle} description={`${todayLabel}. An overview of your school's activity.`} />

      {statsError && <ErrorState title="The numbers could not be loaded" error={statsError} onRetry={retryStats} />}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${statsError ? "hidden" : ""}`}>
        {isStatsLoading
          ? statCards.map((stat) => <StatCardSkeleton key={stat.title} />)
          : statCards.map((stat, index) => (
              <StatCard
                key={stat.title}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                to={stat.to}
                currency={"currency" in stat ? stat.currency : false}
                index={index}
              />
            ))}
      </div>

      <div className="bg-white rounded-xl shadow-xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">{t("labels.quick_actions")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={action.action}
                className="flex items-center justify-center space-x-3 p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-all hover:shadow-sm group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <Icon className="h-6 w-6 text-primary-600 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold text-primary-700">{action.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-10 gap-8">
        {showAttendanceChart && (
          <div className={showNotices ? "md:col-span-7" : "md:col-span-10"}>{chartCard(monthlyAttendanceOptions)}</div>
        )}

        {showNotices && (
          <div
            className={`${showAttendanceChart ? "md:col-span-3" : "md:col-span-10"} bg-white rounded-xl shadow-xl p-6 flex flex-col`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">{t("labels.recent_updates")}</h2>
              {recentUpdates.length > 0 && (
                <Link to={noticesPath} className="text-sm font-medium text-primary-600 hover:text-primary-700">
                  View all
                </Link>
              )}
            </div>
            {isNoticesLoading ? (
              <UpdatesSkeleton />
            ) : recentUpdates.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center text-center space-y-3">
                <div className="p-3 bg-primary-50 rounded-full">
                  <BellIcon className="h-6 w-6 text-primary-600" />
                </div>
                <p className="text-sm text-gray-500">No notices yet. Post one and every parent sees it.</p>
                <button
                  onClick={openNoticeModal}
                  className="px-4 py-2 rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  Post a notice
                </button>
              </div>
            ) : (
              // four fit beside the chart; View all opens the rest
              <div className="divide-y divide-gray-100">
                {recentUpdates.slice(0, 4).map((update, index) => (
                  <Link
                    key={index}
                    to={noticesPath}
                    className="flex items-center justify-between gap-3 -mx-3 px-3 py-4 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{update.title}</p>
                      <p className="text-sm text-gray-500 capitalize">{update.type}</p>
                    </div>
                    <p className="text-sm text-gray-500 shrink-0">{update.date}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-10 gap-8">
        <div className="md:col-span-3 bg-white rounded-xl shadow-xl p-6">
          {isChartsLoading ? (
            <ChartSkeleton />
          ) : hasTeacherStudentData ? (
            <HighchartsReact highcharts={Highcharts} options={teacherStudentRatioOptions} />
          ) : (
            <ChartEmptyState title="Teacher-Student Ratio" message="No teachers or students yet." />
          )}
        </div>
        <div className="md:col-span-7">{chartCard(studentPerformanceOptions)}</div>
      </div>

      <NoticeModal
        isOpen={isNoticeModalOpen}
        onCancel={closeNoticeModal}
        isLoading={isCreatingNotice}
        onSubmit={handleCreateNotice}
        isSuccessNoticeCreation={isSuccessNoticeCreation}
      />

      <UserTypeSelectionModal
        isOpen={isUserTypeModalOpen}
        onClose={closeUserTypeModal}
        onSelectStudent={handleSelectStudent}
        onSelectTeacher={handleSelectTeacher}
      />
    </div>
  );
};

export default Dashboard;
