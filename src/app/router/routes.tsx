import { lazy, ReactNode } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import Layout from "@/app/layout/layout";

import { PermissionGate } from "@/entities/session";

// same profile page for every role, mounted under each role's own path

import NotAccess from "@/shared/ui/not-access";
import { AuthenticatedRoute, FallbackRoute, ProtectedRoute, PublicRoute } from "./route-guards";
import { sharedRoutes } from "./shared-pages";
import { FirstPermittedPage } from "@/entities/session";
import { ModuleGate } from "@/widgets/module-gate";
import { ModuleKey } from "@/shared/types";

// each page loads only when it is opened, so the first visit doesn't download every screen
const AdminDashboard = lazy(() => import("@/pages/admin/dashboard"));
const AdminNotices = lazy(() => import("@/pages/admin/notices"));
const AdminHomework = lazy(() => import("@/pages/admin/homework"));
const AdminReports = lazy(() => import("@/pages/admin/reports"));
const AdminFees = lazy(() => import("@/pages/admin/fees"));
const AdminStudents = lazy(() => import("@/pages/admin/students"));
const StudentForm = lazy(() => import("@/pages/admin/students/student-form"));
const AdminClasses = lazy(() => import("@/pages/admin/classes"));
const AdminTeachers = lazy(() => import("@/pages/admin/teachers"));
const AdminAttendance = lazy(() => import("@/pages/admin/attendance"));
const AdminSettings = lazy(() => import("@/pages/admin/settings"));
const AdminPTM = lazy(() => import("@/pages/admin/ptm"));
const AdminCalendar = lazy(() => import("@/pages/admin/calendar"));
const Timetable = lazy(() => import("@/pages/admin/timetable"));
const AdminLeaveRequests = lazy(() => import("@/pages/admin/leave-requests"));
const AdminPromotion = lazy(() => import("@/pages/admin/promotion"));
const AdminCertificates = lazy(() => import("@/pages/admin/certificates"));
const TeacherDashboard = lazy(() => import("@/pages/teacher/dashboard"));
const TeacherPTM = lazy(() => import("@/pages/teacher/ptm"));
const TeacherMarks = lazy(() => import("@/pages/teacher/marks"));
const ParentDashboard = lazy(() => import("@/pages/parent/dashboard"));
const ParentNotices = lazy(() => import("@/pages/parent/notices"));
const ParentHomework = lazy(() => import("@/pages/parent/homework"));
const ParentAttendance = lazy(() => import("@/pages/parent/attendance"));
const ParentReports = lazy(() => import("@/pages/parent/reports"));
const ParentFees = lazy(() => import("@/pages/parent/fees"));
const ParentPTM = lazy(() => import("@/pages/parent/ptm"));
const ParentLeaveRequests = lazy(() => import("@/pages/parent/leave-requests"));
const Profile = lazy(() => import("@/pages/admin/settings/profile"));
const Login = lazy(() => import("@/pages/auth/login"));
const ForgotPassword = lazy(() => import("@/pages/auth/forgot-password"));
const SetPassword = lazy(() => import("@/pages/auth/set-password"));
const ResetPassword = lazy(() => import("@/pages/auth/reset-password"));
const SupportList = lazy(() => import("@/pages/support/support-list"));
const SupportThread = lazy(() => import("@/pages/support/support-thread"));
const Organization = lazy(() => import("@/pages/auth/organization"));

// a module the school's package leaves out opens read-only for staff
const gate = (module: ModuleKey, element: ReactNode) => <ModuleGate module={module}>{element}</ModuleGate>;

// built once at module load: re-creating the router on a re-render would reset navigation state
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PublicRoute>
        <Navigate to="/login" replace />
      </PublicRoute>
    ),
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <PublicRoute>
        <ForgotPassword />
      </PublicRoute>
    ),
  },
  {
    path: "/organization",
    element: (
      <AuthenticatedRoute>
        <Organization />
      </AuthenticatedRoute>
    ),
  },
  {
    path: "/set-password",
    element: <SetPassword />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/not-access",
    element: <NotAccess />,
  },
  {
    path: "/:organizationId/admin",
    element: (
      <ProtectedRoute role="admin">
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <AdminDashboard />,
      },
      {
        path: "notices",
        element: gate("notices", <AdminNotices />),
      },
      {
        path: "homework",
        element: gate("homework", <AdminHomework />),
      },
      {
        path: "results/*",
        element: gate("exams", <AdminReports />),
      },
      {
        path: "fees",
        element: gate("fees", <AdminFees />),
      },
      {
        path: "students/*",
        element: <AdminStudents />,
      },
      {
        path: "admissions",
        element: (
          <PermissionGate anyOf={["students.manage"]}>
            <StudentForm />
          </PermissionGate>
        ),
      },
      {
        path: "classes",
        element: <AdminClasses />,
      },
      {
        path: "teachers",
        element: <AdminTeachers />,
      },
      {
        path: "attendance",
        element: gate("attendance", <AdminAttendance />),
      },
      {
        path: "ptm",
        element: gate("ptm", <AdminPTM />),
      },
      {
        path: "calendar",
        element: gate("calendar", <AdminCalendar />),
      },
      {
        path: "timetable",
        element: gate("timetable", <Timetable />),
      },
      {
        path: "leave-requests",
        element: gate("leave", <AdminLeaveRequests />),
      },
      {
        path: "promotion",
        element: <AdminPromotion />,
      },
      {
        path: "certificates/*",
        element: gate("certificates", <AdminCertificates />),
      },
      {
        path: "settings/*",
        element: <AdminSettings />,
      },
      { path: "support", element: <SupportList /> },
      { path: "support/:requestId", element: <SupportThread /> },
    ],
  },
  {
    path: "/:organizationId/teacher",
    element: (
      <ProtectedRoute role="teacher">
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <TeacherDashboard />,
      },
      {
        path: "attendance",
        element: gate("attendance", <AdminAttendance />),
      },
      {
        path: "homework",
        element: gate("homework", <AdminHomework />),
      },
      {
        path: "ptm",
        element: gate("ptm", <TeacherPTM />),
      },
      {
        path: "marks",
        element: gate("exams", <TeacherMarks />),
      },
      {
        path: "timetable",
        element: gate("timetable", <Timetable />),
      },
      {
        path: "calendar",
        element: gate("calendar", <AdminCalendar />),
      },
      {
        path: "leave-requests",
        element: gate("leave", <AdminLeaveRequests />),
      },
      {
        path: "profile",
        element: <Profile />,
      },
      { path: "support", element: <SupportList /> },
      { path: "support/:requestId", element: <SupportThread /> },
      ...sharedRoutes(),
    ],
  },
  ...(["accountant", "staff"] as const).map((role) => ({
    path: `/:organizationId/${role}`,
    element: (
      <ProtectedRoute role={role}>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <FirstPermittedPage /> },
      { path: "calendar", element: gate("calendar", <AdminCalendar />) },
      { path: "profile", element: <Profile /> },
      { path: "support", element: <SupportList /> },
      { path: "support/:requestId", element: <SupportThread /> },
      ...sharedRoutes(),
    ],
  })),
  {
    path: "/:organizationId/parent",
    element: (
      <ProtectedRoute role="parent">
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <ParentDashboard />,
      },
      {
        path: "notices",
        element: gate("notices", <ParentNotices />),
      },
      {
        path: "homework",
        element: gate("homework", <ParentHomework />),
      },
      {
        path: "attendance",
        element: gate("attendance", <ParentAttendance />),
      },
      {
        path: "reports",
        element: gate("exams", <ParentReports />),
      },
      {
        path: "fees",
        element: gate("fees", <ParentFees />),
      },
      {
        path: "ptm",
        element: gate("ptm", <ParentPTM />),
      },
      {
        path: "calendar",
        element: gate("calendar", <AdminCalendar />),
      },
      {
        path: "leave-requests",
        element: gate("leave", <ParentLeaveRequests />),
      },
      {
        path: "profile",
        element: <Profile />,
      },
    ],
  },
  {
    path: "*",
    element: <FallbackRoute />,
  },
]);

export default router;
