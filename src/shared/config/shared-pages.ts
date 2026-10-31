import { ComponentType, SVGProps } from "react";
import {
  AcademicCapIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  CurrencyDollarIcon,
  DocumentCheckIcon,
  PresentationChartBarIcon,
  UserGroupIcon,
  UserIcon,
  UserPlusIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

import { ModuleKey, PermissionKey } from "@/shared/types";

export interface SharedPage {
  path: string;
  anyOf: PermissionKey[];
  module?: ModuleKey;
  nav: { name: string; hint: string; icon: ComponentType<SVGProps<SVGSVGElement>> };
}

// admin pages that a permission opens inside any area; the router attaches each page's component
export const SHARED_PAGES: SharedPage[] = [
  {
    path: "school-dashboard",
    anyOf: ["dashboard.view"],
    nav: { name: "School Dashboard", hint: "The whole school at a glance", icon: PresentationChartBarIcon },
  },
  {
    path: "fees",
    module: "fees",
    anyOf: ["fees.collect", "fees.reports", "fees.setup"],
    nav: { name: "Fees", hint: "Collect fees, receipts and reports", icon: CurrencyDollarIcon },
  },
  {
    path: "classes",
    anyOf: ["academics.manage"],
    nav: { name: "Classes", hint: "Years, classes, sections and subjects", icon: AcademicCapIcon },
  },
  {
    path: "students/*",
    anyOf: ["students.view", "students.manage"],
    nav: { name: "Students", hint: "Admissions, profiles and records", icon: UserGroupIcon },
  },
  {
    path: "admissions",
    anyOf: ["students.manage"],
    nav: { name: "Admissions", hint: "Admit a new student", icon: UserPlusIcon },
  },
  {
    path: "promotion",
    anyOf: ["students.manage"],
    nav: { name: "Promotion", hint: "Move students to the next class", icon: ArrowTrendingUpIcon },
  },
  {
    path: "certificates/*",
    module: "certificates",
    anyOf: ["certificates.issue"],
    nav: { name: "Certificates", hint: "Bonafide and transfer certificates", icon: DocumentCheckIcon },
  },
  {
    path: "teachers",
    anyOf: ["people.manage"],
    nav: { name: "Teachers", hint: "Staff profiles and roles", icon: UserIcon },
  },
  {
    path: "notices",
    module: "notices",
    anyOf: ["notices.manage"],
    nav: { name: "Notices", hint: "Announcements to parents and staff", icon: ClipboardDocumentListIcon },
  },
  {
    path: "school-ptm",
    module: "ptm",
    anyOf: ["ptm.manage"],
    nav: { name: "PTM Events", hint: "Schedule parent-teacher meetings", icon: UsersIcon },
  },
  {
    path: "results/*",
    module: "exams",
    anyOf: ["exams.manage"],
    nav: { name: "Results", hint: "Exams, marks and report cards", icon: ChartBarIcon },
  },
  {
    path: "settings/*",
    anyOf: ["people.manage", "school.settings", "fees.setup"],
    nav: { name: "Settings", hint: "People, access and school settings", icon: Cog6ToothIcon },
  },
];
