import { lazy, ReactNode } from "react";

import { PermissionGate } from "@/entities/session";
import { ModuleGate } from "@/widgets/module-gate";
import { SHARED_PAGES } from "@/shared/config/shared-pages";

// each page loads only when it is opened, so the first visit doesn't download every screen
const AdminDashboard = lazy(() => import("@/pages/admin/dashboard"));
const AdminClasses = lazy(() => import("@/pages/admin/classes"));
const AdminStudents = lazy(() => import("@/pages/admin/students"));
const StudentForm = lazy(() => import("@/pages/admin/students/student-form"));
const AdminPromotion = lazy(() => import("@/pages/admin/promotion"));
const AdminTeachers = lazy(() => import("@/pages/admin/teachers"));
const AdminNotices = lazy(() => import("@/pages/admin/notices"));
const AdminPTM = lazy(() => import("@/pages/admin/ptm"));
const AdminFees = lazy(() => import("@/pages/admin/fees"));
const AdminReports = lazy(() => import("@/pages/admin/reports"));
const AdminSettings = lazy(() => import("@/pages/admin/settings"));
const AdminCertificates = lazy(() => import("@/pages/admin/certificates"));

const PAGE_ELEMENTS: Record<string, ReactNode> = {
  "school-dashboard": <AdminDashboard />,
  fees: <AdminFees />,
  classes: <AdminClasses />,
  "students/*": <AdminStudents />,
  admissions: <StudentForm />,
  promotion: <AdminPromotion />,
  "certificates/*": <AdminCertificates />,
  teachers: <AdminTeachers />,
  notices: <AdminNotices />,
  "school-ptm": <AdminPTM />,
  "results/*": <AdminReports />,
  "settings/*": <AdminSettings />,
};

export const sharedRoutes = (except: string[] = []) =>
  SHARED_PAGES.filter((page) => !except.includes(page.path)).map((page) => ({
    path: page.path,
    element: (
      <PermissionGate anyOf={page.anyOf}>
        {page.module ? (
          <ModuleGate module={page.module}>{PAGE_ELEMENTS[page.path]}</ModuleGate>
        ) : (
          PAGE_ELEMENTS[page.path]
        )}
      </PermissionGate>
    ),
  }));
