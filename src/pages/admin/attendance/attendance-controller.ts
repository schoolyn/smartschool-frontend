import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { useGetAcademicYears, useGetClasses, useGetSections } from "../classes/service/academics-service";
import {
  useGetSectionRoster,
  useGetSectionAttendance,
  useMarkAttendance,
  useGetSectionAttendanceReport,
} from "./service/attendance-service";
import { AttendanceStatus } from "@/types";

const today = () => new Date().toISOString().slice(0, 10);
const firstOfMonth = () => `${today().slice(0, 7)}-01`;

type Tab = "mark" | "report";

const useAttendanceController = () => {
  const { organizationId = "" } = useParams();

  const [activeTab, setActiveTab] = useState<Tab>("mark");
  const [academicYearId, setAcademicYearId] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [date, setDate] = useState(today());
  const [reportFrom, setReportFrom] = useState(firstOfMonth());
  const [reportTo, setReportTo] = useState(today());

  const academicYears = useGetAcademicYears(organizationId);
  // the report covers past records, so it also lists classes and sections that have since been switched off
  const listStatus = activeTab === "report" ? undefined : "active";
  const classes = useGetClasses(organizationId, academicYearId, listStatus);
  const sections = useGetSections(organizationId, classId, listStatus);
  const roster = useGetSectionRoster(organizationId, sectionId);
  const existing = useGetSectionAttendance(organizationId, sectionId, date);
  const markAttendance = useMarkAttendance(organizationId);
  const report = useGetSectionAttendanceReport(organizationId, sectionId, reportFrom, reportTo);

  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [reasons, setReasons] = useState<Record<string, string>>({});

  useEffect(() => {
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

  // attendance can only be marked in active classes, so an inactive pick from the report is cleared
  const changeTab = (tab: Tab) => {
    if (tab === "mark") {
      const klass = classes.data?.items.find((item) => item.id === classId);
      const section = sections.data?.items.find((item) => item.id === sectionId);
      if (klass?.status === "inactive") onClassChange("");
      else if (section?.status === "inactive") setSectionId("");
    }
    setActiveTab(tab);
  };

  const onAcademicYearChange = (id: string) => {
    setAcademicYearId(id);
    setClassId("");
    setSectionId("");
  };

  const onClassChange = (id: string) => {
    setClassId(id);
    setSectionId("");
  };

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    setStatuses((prev) => ({ ...prev, [studentId]: status }));
  };

  const setReason = (studentId: string, reason: string) => {
    setReasons((prev) => ({ ...prev, [studentId]: reason }));
  };

  const markAll = (status: AttendanceStatus) => {
    const next: Record<string, AttendanceStatus> = {};
    for (const s of roster.data?.items || []) next[s.id] = status;
    setStatuses(next);
  };

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
    markAttendance.mutate({ sectionId, date, records });
  };

  useEffect(() => {
    if (markAttendance.isSuccess) {
      toast.success("Attendance saved.");
    }
    if (markAttendance.isError) {
      toast.error(markAttendance.error?.response?.Error?.message || "Failed to save attendance");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markAttendance.isSuccess, markAttendance.isError]);

  return {
    activeTab,
    setActiveTab: changeTab,
    reportFrom,
    setReportFrom,
    reportTo,
    setReportTo,
    reportRows: report.data?.items || [],
    reportTotalSessions: report.data?.totalSessions || 0,
    isLoadingReport: report.isLoading,
    academicYears: academicYears.data?.items || [],
    classes: classes.data?.items || [],
    sections: sections.data?.items || [],
    students: roster.data?.items || [],
    isLoadingRoster: roster.isLoading || existing.isLoading,
    academicYearId,
    setAcademicYearId: onAcademicYearChange,
    classId,
    setClassId: onClassChange,
    sectionId,
    setSectionId,
    date,
    setDate,
    statuses,
    reasons,
    setStatus,
    setReason,
    markAll,
    submit,
    isSaving: markAttendance.isPending,
    summary: existing.data?.item?.session?.summary || null,
  };
};

export default useAttendanceController;
