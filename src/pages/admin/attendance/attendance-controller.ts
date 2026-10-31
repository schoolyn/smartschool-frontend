import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useTabParam } from "@/shared/lib/hooks";
import toast from "react-hot-toast";

import { useSectionPicker } from "@/features/section-picker";
import {
  useGetSectionRoster,
  useGetSectionAttendance,
  useMarkAttendance,
  useGetSectionAttendanceReport,
  ISectionAttendanceReportRow,
} from "@/entities/attendance";
import { useGetCalendarMonth } from "@/entities/calendar";
import { AttendanceStatus } from "@/entities/attendance";
import { exportToCsv, localDateString } from "@/shared/lib";

const today = () => localDateString();
const firstOfMonth = () => `${today().slice(0, 7)}-01`;

const ATTENDANCE_TABS = ["mark", "report", "register"] as const;
export type AttendanceTabKey = (typeof ATTENDANCE_TABS)[number];

export const percent = (row: ISectionAttendanceReportRow) =>
  row.total ? ((row.present / row.total) * 100).toFixed(1) : "0";

const useAttendanceController = () => {
  const { organizationId = "" } = useParams();

  const [activeTab, setActiveTab] = useTabParam(ATTENDANCE_TABS, "mark");
  const [date, setDate] = useState(today());
  const [reportFrom, setReportFrom] = useState(firstOfMonth());
  const [reportTo, setReportTo] = useState(today());
  const [registerMonth, setRegisterMonth] = useState(today().slice(0, 7));

  // admins pick from the whole school, teachers their own sections; reports also list since-disabled ones
  const picker = useSectionPicker(organizationId, { includeInactive: activeTab !== "mark" });
  const { academicYearId, classId, sectionId, setSectionId } = picker;
  const roster = useGetSectionRoster(organizationId, sectionId);
  const existing = useGetSectionAttendance(organizationId, sectionId, date);
  const markAttendance = useMarkAttendance(organizationId);
  const report = useGetSectionAttendanceReport(organizationId, sectionId, reportFrom, reportTo);
  const calendar = useGetCalendarMonth(organizationId, Number(date.slice(0, 4)), Number(date.slice(5, 7)));
  // marking is still allowed on a holiday (a make-up day, say), but the teacher should know
  const holiday = calendar.data?.entries.find((entry) => entry.type === "holiday" && entry.date === date);

  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [rosterSearch, setRosterSearch] = useState("");

  useEffect(() => {
    setIsDirty(false);
    if (!existing.data?.item) {
      setStatuses({});
      setReasons({});
      return;
    }
    const nextStatuses: Record<string, AttendanceStatus> = {};
    const nextReasons: Record<string, string> = {};
    for (const r of existing.data.item.records) {
      const sId = typeof r.studentId === "string" ? r.studentId : r.studentId.id;
      nextStatuses[sId] = r.status;
      if (r.reason) nextReasons[sId] = r.reason;
    }
    setStatuses(nextStatuses);
    setReasons(nextReasons);
  }, [existing.data]);

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    setStatuses((prev) => ({ ...prev, [studentId]: status }));
    setIsDirty(true);
  };

  const setReason = (studentId: string, reason: string) => {
    setReasons((prev) => ({ ...prev, [studentId]: reason }));
    setIsDirty(true);
  };

  const markAll = (status: AttendanceStatus) => {
    const next: Record<string, AttendanceStatus> = {};
    for (const s of roster.data?.items || []) next[s.id] = status;
    setStatuses(next);
    setIsDirty(true);
  };

  const students = useMemo(() => roster.data?.items ?? [], [roster.data]);

  const counts = useMemo(() => {
    const tally: Record<AttendanceStatus, number> = { present: 0, absent: 0, late: 0, excused: 0 };
    for (const student of students) tally[statuses[student.id] || "present"] += 1;
    return { total: students.length, ...tally };
  }, [students, statuses]);

  const visibleStudents = useMemo(() => {
    const term = rosterSearch.trim().toLowerCase();
    return term
      ? students.filter((s) => `${s.name} ${s.currentEnrollment?.rollNumber ?? ""}`.toLowerCase().includes(term))
      : students;
  }, [students, rosterSearch]);

  const exportRoster = () =>
    exportToCsv(
      `attendance-${date}`,
      (roster.data?.items || []).map((student) => ({
        student: student.name,
        roll_number: student.currentEnrollment?.rollNumber ?? "",
        status: statuses[student.id] || "present",
        reason: reasons[student.id] || "",
        date,
      }))
    );

  const exportReport = () =>
    exportToCsv(
      `attendance-report-${reportFrom}-to-${reportTo}`,
      (report.data?.items || []).map((row) => ({
        roll_number: row.rollNumber,
        student: row.studentName,
        present: row.present,
        absent: row.absent,
        late: row.late,
        excused: row.excused,
        total_days: row.total,
        attendance_percent: percent(row),
      }))
    );

  const submit = () => {
    const students = roster.data?.items || [];
    if (!sectionId || !date || students.length === 0) {
      toast.error("Select a class, section and date first");
      return;
    }
    const records = students.map((s) => ({
      studentId: s.id,
      status: statuses[s.id] || "present",
      reason: reasons[s.id],
    }));
    markAttendance.mutate(
      { sectionId, date, records },
      {
        onSuccess: () => {
          setIsDirty(false);
          toast.success("Attendance saved.");
        },
        onError: (error) => toast.error(error?.response?.Error?.message || "Failed to save attendance"),
      }
    );
  };

  return {
    activeTab,
    setActiveTab,
    reportFrom,
    setReportFrom,
    reportTo,
    setReportTo,
    registerMonth,
    setRegisterMonth,
    organizationId,
    reportRows: report.data?.items || [],
    reportTotalSessions: report.data?.totalSessions || 0,
    isLoadingReport: report.isLoading,
    academicYears: picker.academicYears,
    classes: picker.classes,
    sections: picker.sections,
    hasNoClasses: picker.hasNoClasses,
    students,
    visibleStudents,
    rosterSearch,
    setRosterSearch,
    counts,
    isDirty,
    isMarked: !!existing.data?.item,
    isLoadingRoster: roster.isLoading || existing.isLoading,
    academicYearId,
    setAcademicYearId: picker.setAcademicYearId,
    classId,
    setClassId: picker.setClassId,
    sectionId,
    setSectionId,
    date,
    setDate,
    // attendance is never marked or reported for days that haven't happened
    maxDate: today(),
    statuses,
    reasons,
    setStatus,
    setReason,
    markAll,
    exportRoster,
    exportReport,
    submit,
    isSaving: markAttendance.isPending,
    holidayTitle: holiday?.title ?? "",
  };
};

export default useAttendanceController;
