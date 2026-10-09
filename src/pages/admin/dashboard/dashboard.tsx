import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Link } from "react-router-dom";
import { BellIcon } from "@heroicons/react/24/outline";

import NoticeModal from "@/components/notice-modal";
import SectionHeader from "@/components/section-header";
import { useDashboardController } from "./dashboard-controller";
import UserTypeSelectionModal from "@/components/user-type-selection-modal";
import StatCard from "./stat-card";
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
    isStatsLoading,
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

  const chartCard = (options: typeof studentPerformanceOptions | typeof teacherStudentRatioOptions | typeof monthlyAttendanceOptions) => (
    <div className="bg-white rounded-xl shadow-xl p-6">
      {isChartsLoading ? <ChartSkeleton /> : <HighchartsReact highcharts={Highcharts} options={options} />}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 min-h-screen">
      <SectionHeader title={greetingTitle} description={`${todayLabel}. An overview of your school's activity.`} />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Quick Actions */}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts Grid */}
        <div className="lg:col-span-2 space-y-8">
          {chartCard(studentPerformanceOptions)}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {chartCard(teacherStudentRatioOptions)}
            {chartCard(monthlyAttendanceOptions)}
          </div>
        </div>

        {/* Recent Updates */}
        <div className="bg-white rounded-xl shadow-xl p-6 self-start">
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
            <div className="flex flex-col items-center text-center py-8 space-y-3">
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
            <div>
              {recentUpdates.map((update, index) => (
                <Link
                  key={index}
                  to={noticesPath}
                  className="flex items-center justify-between gap-3 -mx-3 px-3 py-4 rounded-lg border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
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
