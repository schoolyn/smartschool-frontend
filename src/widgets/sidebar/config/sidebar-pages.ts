import type { ComponentType, SVGProps } from "react";
import { CalendarIcon, Squares2X2Icon } from "@heroicons/react/24/outline";

import type { ModuleKey } from "@/shared/types";
import type { AttentionKey } from "../api/attention-service";

export interface SidebarPage {
  name: string;
  hint: string;
  // under the role's area, e.g. "students" for /:org/admin/students
  path: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  // shows a count when something on this page waits on the user
  attention?: AttentionKey;
  // the package module it belongs to; left out, it follows from the path
  module?: ModuleKey;
}

// a main-menu entry that slides open its own panel of pages
export interface SidebarGroup {
  label: string;
  hint: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  pages: SidebarPage[];
}

// a line between parts of the menu
export interface SidebarDivider {
  divider: true;
}

export const DIVIDER: SidebarDivider = { divider: true };

export type SidebarMenuEntry = SidebarPage | SidebarGroup | SidebarDivider;

export const isGroup = (entry: SidebarMenuEntry): entry is SidebarGroup => "pages" in entry;
export const isDivider = (entry: SidebarMenuEntry): entry is SidebarDivider => "divider" in entry;

export type SidebarMenu = SidebarMenuEntry[];

// up to this many pages show flat; beyond it the rest go into one section
export const FLAT_MENU_LIMIT = 8;
// how many pages a long, generated menu keeps on show before the rest go into a section
export const MAIN_LIMIT = 6;

// a page's module follows from its path, the same way the routes gate it
const MODULE_BY_PATH: Record<string, ModuleKey> = {
  attendance: "attendance",
  homework: "homework",
  timetable: "timetable",
  "leave-requests": "leave",
  results: "exams",
  marks: "exams",
  reports: "exams",
  fees: "fees",
  notices: "notices",
  calendar: "calendar",
  ptm: "ptm",
  certificates: "certificates",
  "settings/online-payments": "onlinePayments",
};

// "fees?tab=ledger" belongs to fees; "settings/online-payments" has its own module
export const moduleFor = (page: SidebarPage) => {
  if (page.module) return page.module;
  const bare = page.path.split("?")[0];
  return MODULE_BY_PATH[bare] ?? MODULE_BY_PATH[bare.split("/")[0]];
};

// the section a long generated menu (accountant, staff) puts its extra pages in
export const morePages = (pages: SidebarPage[]): SidebarGroup => ({
  label: "More pages",
  hint: "Every other page",
  icon: Squares2X2Icon,
  pages,
});

export const CALENDAR_PAGE: SidebarPage = {
  name: "Calendar",
  hint: "Holidays, events and exams",
  path: "calendar",
  icon: CalendarIcon,
};
