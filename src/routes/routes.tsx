import { createBrowserRouter, Navigate } from "react-router-dom";

import Layout from "../components/layout/layout";

// Admin Pages
import AdminDashboard from "../pages/admin/dashboard";
import AdminNotices from "../pages/admin/notices";
import AdminHomework from "../pages/admin/homework";
import AdminReports from "../pages/admin/reports";
import AdminFees from "../pages/admin/fees";
import AdminStudents from "../pages/admin/students";
import AdminClasses from "../pages/admin/classes";
import AdminTeachers from "../pages/admin/teachers";
import AdminAttendance from "../pages/admin/attendance";
import AdminSettings from "../pages/admin/settings";
import AdminPTM from "../pages/admin/ptm";
import AdminLeaveRequests from "../pages/admin/leave-requests";
import AdminPromotion from "../pages/admin/promotion";

// Teacher Pages
import TeacherDashboard from "../pages/teacher/dashboard";
import TeacherPTM from "../pages/teacher/ptm";

// Parent Pages
import ParentDashboard from "../pages/parent/dashboard";
import ParentNotices from "../pages/parent/notices";
import ParentHomework from "../pages/parent/homework";
import ParentReports from "../pages/parent/reports";
import ParentFees from "../pages/parent/fees";
import ParentPTM from "../pages/parent/ptm";
import ParentLeaveRequests from "../pages/parent/leave-requests";

// shared, same profile page for every role, just mounted under each role's own path
import Profile from "../pages/admin/settings/profile";

// Auth Pages
import Login from "../pages/auth/login";
import ForgotPassword from "../pages/auth/forgot-password";
import SetPassword from "../pages/auth/set-password";
import NotAccess from "../components/not-access";
import { AuthenticatedRoute, FallbackRoute, PlatformRoute, ProtectedRoute, PublicRoute } from "./route-guards";
import Organization from "../pages/auth/organization";
import Platform from "../pages/platform";

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
    path: "/platform",
    element: (
      <PlatformRoute>
        <Platform />
      </PlatformRoute>
    ),
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
        element: <AdminNotices />,
      },
      {
        path: "homework",
        element: <AdminHomework />,
      },
      {
        path: "results",
        element: <AdminReports />,
      },
      {
        path: "fees",
        element: <AdminFees />,
      },
      {
        path: "students/*",
        element: <AdminStudents />,
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
        element: <AdminAttendance />,
      },
      {
        path: "ptm",
        element: <AdminPTM />,
      },
      {
        path: "leave-requests",
        element: <AdminLeaveRequests />,
      },
      {
        path: "promotion",
        element: <AdminPromotion />,
      },
      {
        path: "settings/*",
        element: <AdminSettings />,
      },
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
        element: <AdminAttendance />,
      },
      {
        path: "homework",
        element: <AdminHomework />,
      },
      {
        path: "ptm",
        element: <TeacherPTM />,
      },
      {
        path: "leave-requests",
        element: <AdminLeaveRequests />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
    ],
  },
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
        element: <ParentNotices />,
      },
      {
        path: "homework",
        element: <ParentHomework />,
      },
      {
        path: "reports",
        element: <ParentReports />,
      },
      {
        path: "fees",
        element: <ParentFees />,
      },
      {
        path: "ptm",
        element: <ParentPTM />,
      },
      {
        path: "leave-requests",
        element: <ParentLeaveRequests />,
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
