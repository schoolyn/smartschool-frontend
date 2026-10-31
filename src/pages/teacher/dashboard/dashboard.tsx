import ErrorState from "@/shared/ui/error-state";
import PageLoader from "@/shared/ui/page-loader";
import SectionHeader from "@/shared/ui/section-header";
import useTeacherDashboardController from "./dashboard-controller";
import EmptyState from "@/shared/ui/empty-state";

const TeacherDashboard = () => {
  const c = useTeacherDashboardController();

  if (c.isLoading) {
    return <PageLoader />;
  }
  // a failed load says so, rather than showing a teacher with no classes and no notices
  if (c.loadError) {
    return <ErrorState error={c.loadError} onRetry={c.retryLoad} />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <SectionHeader title={`Welcome, ${c.name}`} description="Here's your teaching overview for today" />

      <div className={`grid grid-cols-1 gap-6 ${c.showTimetable && c.showNotices ? "lg:grid-cols-2" : ""}`}>
        {c.showTimetable && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Today's Timetable ({c.todayName})</h2>
            </div>
            {c.holidayTitle && (
              <p className="border-b border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Today is a holiday on the school calendar ({c.holidayTitle}). These are your usual periods for a{" "}
                {c.todayName}.
              </p>
            )}
            <div className="divide-y divide-gray-100">
              {c.todaySlots.length === 0 ? (
                <EmptyState compact title="No classes scheduled for today" />
              ) : (
                c.todaySlots.map((slot) => (
                  <div key={slot.id} className="px-4 py-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {slot.subjectId?.name} - {slot.classId?.name} {slot.sectionId?.name}
                      </p>
                      {slot.room && <p className="text-xs text-gray-500">Room {slot.room}</p>}
                    </div>
                    <p className="text-sm text-gray-500">
                      {slot.startTime} - {slot.endTime}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {c.showNotices && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Recent Notices</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {c.recentNotices.length === 0 ? (
                <EmptyState compact title="No notices yet" />
              ) : (
                c.recentNotices.map((notice) => (
                  <div key={notice.id} className="px-4 py-4 flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-900">{notice.title}</p>
                    <p className="text-sm text-gray-500">{new Date(notice.createdAt).toLocaleDateString()}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Assigned Classes</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {c.assignments.length === 0 ? (
            <p className="px-4 py-5 text-sm text-gray-500">You have no class assignments yet.</p>
          ) : (
            c.assignments.map((a) => (
              <div key={a.id} className="px-4 py-4 flex justify-between items-center">
                <p className="text-sm font-medium text-gray-900">
                  {a.classId?.name} {a.sectionId?.name}
                  {a.subjectId && <span className="text-gray-500"> - {a.subjectId.name}</span>}
                </p>
                <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {a.assignmentRole === "CLASS_TEACHER" ? "Class Teacher" : "Subject Teacher"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
