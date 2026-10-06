import Spinner from "@/components/spinner";
import SectionHeader from "@/components/section-header";
import CustomSelectDropdown from "@/components/custom-select";
import useAttendanceController from "./attendance-controller";
import { AttendanceStatus, SelectOption } from "@/types";
import { exportToCsv } from "@/utils";

const inputClass =
  "mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm";
const btnPrimary =
  "inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50";
const btnSecondary =
  "inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50";

const STATUS_STYLES: Record<AttendanceStatus, string> = {
  present: "bg-green-100 text-green-800 border-green-300",
  absent: "bg-red-100 text-red-800 border-red-300",
  late: "bg-amber-100 text-amber-800 border-amber-300",
  excused: "bg-blue-100 text-blue-800 border-blue-300",
};

const AdminAttendance = () => {
  const c = useAttendanceController();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <SectionHeader title="Attendance" description="Mark daily attendance, or review it over a date range" />

      <div className="flex gap-6 border-b border-gray-200">
        {(["mark", "report"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => c.setActiveTab(tab)}
            className={`whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium ${
              c.activeTab === tab
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "mark" ? "Mark Attendance" : "Attendance Report"}
          </button>
        ))}
      </div>

      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
            <CustomSelectDropdown
              placeholder="Select"
              options={c.academicYears.map((y): SelectOption => ({ id: y.id, name: y.name }))}
              value={(() => {
                const y = c.academicYears.find((y) => y.id === c.academicYearId);
                return y ? { id: y.id, name: y.name } : null;
              })()}
              onChange={(o) => c.setAcademicYearId(String(o.id))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <CustomSelectDropdown
              placeholder="Select"
              disabled={!c.academicYearId}
              options={c.classes.map((k): SelectOption => ({ id: k.id, name: k.name }))}
              value={(() => {
                const k = c.classes.find((k) => k.id === c.classId);
                return k ? { id: k.id, name: k.name } : null;
              })()}
              onChange={(o) => c.setClassId(String(o.id))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
            <CustomSelectDropdown
              placeholder="Select"
              disabled={!c.classId}
              options={c.sections.map((s): SelectOption => ({ id: s.id, name: s.name }))}
              value={(() => {
                const s = c.sections.find((s) => s.id === c.sectionId);
                return s ? { id: s.id, name: s.name } : null;
              })()}
              onChange={(o) => c.setSectionId(String(o.id))}
            />
          </div>
          {c.activeTab === "mark" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input type="date" className={inputClass} value={c.date} onChange={(e) => c.setDate(e.target.value)} />
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">From</label>
                <input
                  type="date"
                  className={inputClass}
                  value={c.reportFrom}
                  onChange={(e) => c.setReportFrom(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">To</label>
                <input
                  type="date"
                  className={inputClass}
                  value={c.reportTo}
                  onChange={(e) => c.setReportTo(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {c.activeTab === "report" && c.sectionId && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">
              Attendance over {c.reportFrom} – {c.reportTo}
              <span className="text-sm text-gray-500 font-normal"> — {c.reportTotalSessions} day(s) marked</span>
            </h2>
            {c.reportRows.length > 0 && (
              <button
                className={btnSecondary}
                onClick={() =>
                  exportToCsv(
                    `attendance-report-${c.reportFrom}-to-${c.reportTo}`,
                    c.reportRows.map((row) => ({
                      roll_number: row.rollNumber,
                      student: row.studentName,
                      present: row.present,
                      absent: row.absent,
                      late: row.late,
                      excused: row.excused,
                      total_days: row.total,
                      attendance_percent: row.total ? ((row.present / row.total) * 100).toFixed(1) : "0",
                    }))
                  )
                }
              >
                Export CSV
              </button>
            )}
          </div>

          {c.isLoadingReport ? (
            <Spinner />
          ) : c.reportRows.length === 0 ? (
            <p className="px-4 py-5 text-sm text-gray-500">No attendance marked for this section in this range.</p>
          ) : (
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Present</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Absent</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Late</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Excused</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">%</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {c.reportRows.map((row) => (
                  <tr key={row.studentId}>
                    <td className="px-4 py-3 text-sm text-gray-500">{row.rollNumber}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.studentName}</td>
                    <td className="px-4 py-3 text-sm text-center text-green-700">{row.present}</td>
                    <td className="px-4 py-3 text-sm text-center text-red-700">{row.absent}</td>
                    <td className="px-4 py-3 text-sm text-center text-amber-700">{row.late}</td>
                    <td className="px-4 py-3 text-sm text-center text-blue-700">{row.excused}</td>
                    <td className="px-4 py-3 text-sm text-center font-medium text-gray-900">
                      {row.total ? ((row.present / row.total) * 100).toFixed(1) : "0"}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
      )}

      {c.activeTab === "mark" && c.sectionId && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">
              Students{" "}
              {c.summary && (
                <span className="text-sm text-gray-500 font-normal">
                  — {c.summary.present} present / {c.summary.total} total
                </span>
              )}
            </h2>
            <div className="flex gap-2">
              <button
                className={btnSecondary}
                onClick={() =>
                  exportToCsv(
                    `attendance-${c.date}`,
                    c.students.map((student) => ({
                      student: student.name,
                      roll_number: student.currentEnrollment?.rollNumber ?? "",
                      status: c.statuses[student.id] || "present",
                      reason: c.reasons[student.id] || "",
                      date: c.date,
                    }))
                  )
                }
              >
                Export CSV
              </button>
              <button className={btnSecondary} onClick={() => c.markAll("present")}>
                Mark all present
              </button>
              <button className={btnSecondary} onClick={() => c.markAll("absent")}>
                Mark all absent
              </button>
            </div>
          </div>

          {c.isLoadingRoster ? (
            <Spinner />
          ) : c.students.length === 0 ? (
            <p className="px-4 py-5 text-sm text-gray-500">No students in this section.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {c.students.map((student) => (
                <div key={student.id} className="px-4 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{student.name}</p>
                    <p className="text-xs text-gray-500">Roll No. {student.currentEnrollment?.rollNumber}</p>
                  </div>
                  <div className="flex gap-2">
                    {(["present", "absent", "late", "excused"] as AttendanceStatus[]).map((status) => (
                      <button
                        key={status}
                        onClick={() => c.setStatus(student.id, status)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${
                          (c.statuses[student.id] || "present") === status
                            ? STATUS_STYLES[status]
                            : "bg-white text-gray-500 border-gray-300"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                  {(c.statuses[student.id] === "absent" ||
                    c.statuses[student.id] === "late" ||
                    c.statuses[student.id] === "excused") && (
                    <input
                      type="text"
                      placeholder="Reason (optional)"
                      className="w-40 rounded-md border border-gray-300 px-2 py-1 text-xs"
                      value={c.reasons[student.id] || ""}
                      onChange={(e) => c.setReason(student.id, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="px-4 py-4 border-t border-gray-200 flex justify-end">
            <button onClick={c.submit} disabled={c.isSaving} className={btnPrimary}>
              Save Attendance
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAttendance;
