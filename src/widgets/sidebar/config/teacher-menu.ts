import {
  BookOpenIcon,
  CalendarDaysIcon,
  CalendarIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  HomeIcon,
  TableCellsIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

import { DIVIDER, type SidebarMenu } from "./sidebar-pages";

export const TEACHER_MENU: SidebarMenu = [
  { name: "Dashboard", hint: "Your classes at a glance", path: "dashboard", icon: HomeIcon },
  DIVIDER,
  {
    name: "Attendance",
    hint: "Mark your section's attendance",
    path: "attendance",
    icon: ClipboardDocumentCheckIcon,
  },
  { name: "Homework", hint: "Assign and review homework", path: "homework", icon: BookOpenIcon },
  { name: "Marks Entry", hint: "Enter exam marks", path: "marks", icon: ChartBarIcon },
  { name: "My Timetable", hint: "Your periods this week", path: "timetable", icon: TableCellsIcon },
  {
    name: "Leave Requests",
    hint: "Review leave for your class",
    path: "leave-requests",
    icon: CalendarDaysIcon,
    attention: "leaveRequests",
  },
  {
    label: "School life",
    hint: "Calendar and parent meetings",
    icon: CalendarIcon,
    pages: [
      { name: "Calendar", hint: "Holidays, events and exams", path: "calendar", icon: CalendarIcon },
      { name: "PTM", hint: "Your parent meetings", path: "ptm", icon: UsersIcon, attention: "ptmBookings" },
    ],
  },
];
