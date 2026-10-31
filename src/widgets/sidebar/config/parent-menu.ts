import {
  BookOpenIcon,
  CalendarDaysIcon,
  CalendarIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  HomeIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

import { DIVIDER, type SidebarMenu } from "./sidebar-pages";

export const PARENT_MENU: SidebarMenu = [
  { name: "Dashboard", hint: "Your child's day at a glance", path: "dashboard", icon: HomeIcon },
  DIVIDER,
  { name: "Attendance", hint: "Present and absent days", path: "attendance", icon: ClipboardDocumentCheckIcon },
  { name: "Homework", hint: "What's due and when", path: "homework", icon: BookOpenIcon },
  { name: "Notices", hint: "School announcements", path: "notices", icon: ClipboardDocumentListIcon },
  { name: "Fees", hint: "Dues, receipts and payments", path: "fees", icon: CurrencyDollarIcon },
  { name: "Results", hint: "Marks and report cards", path: "reports", icon: ChartBarIcon },
  { name: "Calendar", hint: "Holidays, events and exams", path: "calendar", icon: CalendarIcon },
  { name: "PTM", hint: "Book a meeting with the teacher", path: "ptm", icon: UsersIcon },
  { name: "Leave Requests", hint: "Ask for a day off", path: "leave-requests", icon: CalendarDaysIcon },
];
