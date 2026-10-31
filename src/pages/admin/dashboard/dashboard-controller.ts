import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

import {
  UserGroupIcon,
  UserIcon,
  AcademicCapIcon,
  BellIcon,
  CurrencyDollarIcon,
  ClipboardDocumentCheckIcon,
  BookOpenIcon,
  PlusIcon,
  DocumentPlusIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";

import { ICreateNoticeRequest } from "@/entities/notice";
import { ModuleKey } from "@/shared/types";
import { useGetNoticeList, useCreateNotice } from "@/entities/notice";
import { useError } from "@/shared/lib/hooks";
import { useTheme } from "@/features/theme";
import { useAuth } from "@/entities/session";
import { useGetDashboardStats } from "@/entities/dashboard";
import { useGetDashboardCharts } from "@/entities/dashboard";
import { useAreaBase, useHasModule } from "@/entities/session";

export const useDashboardController = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { user } = useAuth();

  // Tailwind dark mode can't reach Highcharts' inline SVG, so the options switch colors per theme
  const isDark = theme === "dark";
  const chartAxisLabelColor = isDark ? "#9CA3AF" : "#6B7280";
  const chartLegendColor = isDark ? "#D1D5DB" : "#4B5563";
  const chartTitleColor = isDark ? "#F9FAFB" : "#1F2937";
  const chartGridLineColor = isDark ? "#374151" : "#E5E7EB";
  // one accent color per chart, lightened a touch in dark mode so it still reads on a dark card
  const examTrendColor = isDark ? "#60A5FA" : "#2563EB";
  const examTrendFillRgb = isDark ? "96, 165, 250" : "37, 99, 235";
  const attendanceFillRgb = isDark ? "74, 222, 128" : "22, 163, 74";
  const teacherSliceColor = isDark ? "#60A5FA" : "#2563EB";
  const studentSliceColor = isDark ? "#FBBF24" : "#F59E0B";

  const { organizationId } = useParams();

  const areaBase = useAreaBase();
  const hasModule = useHasModule();
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [isUserTypeModalOpen, setIsUserTypeModalOpen] = useState(false);

  const recentNotices = useGetNoticeList(organizationId, "", "", 5, 1);
  const dashboardStats = useGetDashboardStats(organizationId || "");
  const dashboardCharts = useGetDashboardCharts(organizationId || "");
  const createNotice = useCreateNotice(organizationId || "");

  useError({ mutation: createNotice });

  const recentUpdates = (recentNotices.data?.rows || []).map((notice) => ({
    type: notice.type,
    title: notice.title,
    date: new Date(notice.createdAt).toLocaleDateString(),
  }));

  const stats = {
    totalStudents: dashboardStats.data?.totalStudents ?? 0,
    totalTeachers: dashboardStats.data?.totalTeachers ?? 0,
    totalClasses: dashboardStats.data?.totalClasses ?? 0,
    activeNotices: dashboardStats.data?.activeNotices ?? 0,
    pendingPayments: dashboardStats.data?.pendingPayments ?? null,
    attendanceSubmitted: dashboardStats.data?.attendanceToday ?? null,
    homeworksIssued: dashboardStats.data?.homeworksToday ?? null,
  };

  const examTrend = dashboardCharts.data?.examTrend || [];
  const monthlyAttendance = dashboardCharts.data?.monthlyAttendance || [];

  const studentPerformanceOptions = {
    credits: { enabled: false },
    chart: { type: "areaspline", height: 300, style: { fontFamily: "inherit" }, backgroundColor: "transparent" },
    title: {
      text: "Exam Performance Trend",
      style: { fontSize: "16px", fontWeight: "500", color: chartTitleColor },
    },
    xAxis: {
      categories: examTrend.length ? examTrend.map((e) => e.name) : ["No published exams yet"],
      labels: { style: { color: chartAxisLabelColor } },
      lineColor: chartGridLineColor,
      tickColor: chartGridLineColor,
    },
    yAxis: {
      title: { text: "Average %", style: { color: chartAxisLabelColor } },
      labels: { style: { color: chartAxisLabelColor } },
      gridLineColor: chartGridLineColor,
      max: 100,
      min: 0,
    },
    series: [
      {
        name: "Average score",
        data: examTrend.length ? examTrend.map((e) => e.percentage) : [0],
        color: examTrendColor,
        lineWidth: 3,
        marker: { enabled: true, radius: 5, lineWidth: 2, lineColor: isDark ? "#262626" : "#ffffff" },
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, `rgba(${examTrendFillRgb}, 0.3)`],
            [1, `rgba(${examTrendFillRgb}, 0.02)`],
          ],
        },
      },
    ],
    legend: { itemStyle: { color: chartLegendColor } },
  };

  // a pie of zero-value slices still draws connectors to an empty circle, which reads as broken
  const hasTeacherStudentData = stats.totalTeachers > 0 || stats.totalStudents > 0;

  const teacherStudentRatioOptions = {
    credits: { enabled: false },
    chart: { type: "pie", height: 300, style: { fontFamily: "inherit" }, backgroundColor: "transparent" },
    title: {
      text: "Teacher-Student Ratio",
      style: { fontSize: "16px", fontWeight: "500", color: chartTitleColor },
    },
    series: [
      {
        name: "Count",
        data: [
          { name: "Teachers", y: stats.totalTeachers, color: teacherSliceColor },
          { name: "Students", y: stats.totalStudents, color: studentSliceColor },
        ],
        dataLabels: { style: { color: chartTitleColor, textOutline: "none" } },
      },
    ],
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        dataLabels: { enabled: true, format: "{point.percentage:.1f}%" },
      },
    },
  };

  const monthlyAttendanceOptions = {
    credits: { enabled: false },
    chart: { type: "column", height: 300, style: { fontFamily: "inherit" }, backgroundColor: "transparent" },
    title: {
      text: "Monthly Attendance Summary",
      style: { fontSize: "16px", fontWeight: "500", color: chartTitleColor },
    },
    xAxis: {
      categories: monthlyAttendance.length ? monthlyAttendance.map((m) => m.month) : ["No attendance marked yet"],
      labels: { style: { color: chartAxisLabelColor } },
      lineColor: chartGridLineColor,
      tickColor: chartGridLineColor,
    },
    yAxis: {
      title: { text: "Attendance %", style: { color: chartAxisLabelColor } },
      labels: { style: { color: chartAxisLabelColor } },
      gridLineColor: chartGridLineColor,
      max: 100,
      min: 0,
    },
    series: [
      {
        name: "Attendance",
        data: monthlyAttendance.length ? monthlyAttendance.map((m) => m.percentage) : [0],
        color: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, `rgba(${attendanceFillRgb}, 1)`],
            [1, `rgba(${attendanceFillRgb}, 0.55)`],
          ],
        },
      },
    ],
    plotOptions: { column: { borderRadius: 5 } },
  };

  const openNoticeModal = () => setIsNoticeModalOpen(true);
  const closeNoticeModal = () => setIsNoticeModalOpen(false);

  const handleCreateNotice = async (formData: ICreateNoticeRequest) => {
    const noticeFormData = new FormData();
    noticeFormData.append("title", formData.title);
    noticeFormData.append("content", formData.content);
    noticeFormData.append("type", formData.type);
    if (formData.date) noticeFormData.append("date", formData.date);
    if (formData.attachment instanceof File) noticeFormData.append("attachment", formData.attachment);
    if (formData.audience) noticeFormData.append("audience", JSON.stringify(formData.audience));

    createNotice.mutate(noticeFormData);
  };

  useEffect(() => {
    if (createNotice.isSuccess) {
      toast.success(t("messages.notice_created_successfully"));
      recentNotices.refetch();
      setIsNoticeModalOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createNotice.isSuccess]);

  const openUserTypeModal = () => setIsUserTypeModalOpen(true);
  const closeUserTypeModal = () => setIsUserTypeModalOpen(false);

  const handleSelectStudent = () => {
    closeUserTypeModal();
    navigate(`${areaBase}/students`);
  };

  const handleSelectTeacher = () => {
    closeUserTypeModal();
    navigate(`${areaBase}/teachers`);
  };

  const handleUploadHomework = () => {
    navigate(`${areaBase}/homework`);
  };

  const base = `/${organizationId}/admin`;
  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents as number | null,
      icon: UserGroupIcon,
      to: `${base}/students`,
    },
    { title: "Total Teachers", value: stats.totalTeachers as number | null, icon: UserIcon, to: `${base}/teachers` },
    {
      title: "Total Classes",
      value: stats.totalClasses as number | null,
      icon: AcademicCapIcon,
      to: `${base}/classes`,
    },
    {
      title: "Active Notices",
      value: stats.activeNotices as number | null,
      icon: BellIcon,
      to: `${base}/notices`,
      module: "notices",
    },
    {
      title: "Pending Payments",
      value: stats.pendingPayments === null ? null : stats.pendingPayments / 100,
      icon: CurrencyDollarIcon,
      to: `${base}/fees`,
      currency: true,
      module: "fees",
    },
    {
      title: "Attendance Today",
      value: stats.attendanceSubmitted,
      icon: ClipboardDocumentCheckIcon,
      to: `${base}/attendance`,
      module: "attendance",
    },
    {
      title: "Homeworks Today",
      value: stats.homeworksIssued,
      icon: BookOpenIcon,
      to: `${base}/homework`,
      module: "homework",
    },
  ].filter((card) => !card.module || hasModule(card.module as ModuleKey));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.name?.trim().split(" ")[0];
  const greetingTitle = firstName ? `${greeting}, ${firstName}` : greeting;
  const todayLabel = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  // cards and shortcuts for a locked module are left out
  const quickActions = [
    { title: "Add New Notice", icon: PlusIcon, action: openNoticeModal, module: "notices" },
    { title: "Upload Homework", icon: DocumentPlusIcon, action: handleUploadHomework, module: "homework" },
    { title: "Add Student/Teacher", icon: UserPlusIcon, action: openUserTypeModal },
  ].filter((quick) => !quick.module || hasModule(quick.module as ModuleKey));

  return {
    t,
    stats,
    showAttendanceChart: hasModule("attendance"),
    showNotices: hasModule("notices"),
    recentUpdates,
    studentPerformanceOptions,
    teacherStudentRatioOptions,
    monthlyAttendanceOptions,
    hasTeacherStudentData,
    isStatsLoading: dashboardStats.isLoading,
    // failed stats must not show as zero students and zero teachers
    statsError: dashboardStats.isError ? dashboardStats.error : null,
    retryStats: () => dashboardStats.refetch(),
    isNoticesLoading: recentNotices.isLoading,
    isChartsLoading: dashboardCharts.isLoading,
    greetingTitle,
    todayLabel,
    noticesPath: `${base}/notices`,
    isNoticeModalOpen,
    isUserTypeModalOpen,
    statCards,
    quickActions,
    openNoticeModal,
    closeNoticeModal,
    handleCreateNotice,
    isCreatingNotice: createNotice.isPending,
    isSuccessNoticeCreation: createNotice.isSuccess,
    openUserTypeModal,
    closeUserTypeModal,
    handleSelectStudent,
    handleSelectTeacher,
  };
};
