import { useLayoutStore } from "@/shared/model/layout-store";
import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { ComponentType, SVGProps } from "react";

import { useCan, useCurrentRole, useHasModule } from "@/entities/session";
import { SHARED_PAGES } from "@/shared/config/shared-pages";
import { useGetAttention } from "../api/attention-service";
import { ADMIN_MENU } from "../config/admin-menu";
import { PARENT_MENU } from "../config/parent-menu";
import { TEACHER_MENU } from "../config/teacher-menu";
import {
  CALENDAR_PAGE,
  FLAT_MENU_LIMIT,
  MAIN_LIMIT,
  SidebarMenu,
  SidebarMenuEntry,
  SidebarPage,
  isDivider,
  isGroup,
  moduleFor,
  morePages,
} from "../config/sidebar-pages";

export interface SidebarItem {
  name: string;
  hint: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  current: boolean;
  count: number;
  // its module isn't in the school's package
  locked: boolean;
}

export interface SidebarSection {
  label: string;
  hint: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  items: SidebarItem[];
  // one of its pages is open
  current: boolean;
  // one of its pages needs the user
  needsAttention: boolean;
}

export type SidebarEntryModel =
  { kind: "page"; item: SidebarItem } | { kind: "section"; section: SidebarSection } | { kind: "divider"; key: string };

// granted-page menus (accountant, staff) split by count
const splitPages = (pages: SidebarPage[]): SidebarMenu =>
  pages.length <= FLAT_MENU_LIMIT ? pages : [...pages.slice(0, MAIN_LIMIT), morePages(pages.slice(MAIN_LIMIT))];

export const useSidebarController = () => {
  const { organizationId = "" } = useParams();
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  // the role decides the menu; permissions add granted pages
  const role = useCurrentRole() ?? "admin";
  const can = useCan();
  const hasModule = useHasModule();

  const granted: SidebarPage[] = SHARED_PAGES.filter((shared) => can(...shared.anyOf)).map((shared) => ({
    ...shared.nav,
    path: shared.path.replace("/*", ""),
    module: shared.module,
  }));
  const menuByRole: Record<typeof role, () => SidebarMenu> = {
    admin: () => ADMIN_MENU,
    parent: () => PARENT_MENU,
    teacher: () => [
      ...TEACHER_MENU,
      ...(granted.length ? [{ ...morePages(granted), label: "School", hint: "Pages the school opened for you" }] : []),
    ],
    accountant: () => splitPages([...granted, CALENDAR_PAGE]),
    staff: () => splitPages([...granted, CALENDAR_PAGE]),
  };
  // parents never see a locked module; staff see it with a lock
  const isLocked = (page: SidebarPage) => {
    const module = moduleFor(page);
    return !!module && !hasModule(module);
  };
  const visible = (pages: SidebarPage[]) => (role === "parent" ? pages.filter((p) => !isLocked(p)) : pages);
  const chosen = menuByRole[role]();

  const attention = useGetAttention(organizationId, role !== "parent").data;
  // a link to a tab ("fees?tab=ledger") is current only on that tab
  const openTab = new URLSearchParams(search).get("tab");
  // a page inside a tab ("results/exams/123") counts as that tab ("results?tab=exams")
  const isCurrent = (href: string) => {
    const [path, query] = href.split("?");
    const tab = query && new URLSearchParams(query).get("tab");
    if (pathname === path) return !tab || tab === openTab;
    if (!pathname.startsWith(`${path}/`)) return false;
    return !tab || pathname.slice(path.length + 1).split("/")[0] === tab;
  };
  const toItem = (page: SidebarPage): SidebarItem => {
    const href = `/${organizationId}/${role}/${page.path}`;
    return {
      name: page.name,
      hint: page.hint,
      href,
      icon: page.icon,
      current: isCurrent(href),
      count: page.attention ? (attention?.[page.attention] ?? 0) : 0,
      locked: isLocked(page),
    };
  };

  // a section with one or two pages shows them as plain links; an empty one disappears
  const toEntries = (entry: SidebarMenuEntry, index: number): SidebarEntryModel[] => {
    if (isDivider(entry)) return [{ kind: "divider", key: `divider-${index}` }];
    if (!isGroup(entry)) return visible([entry]).map((page) => ({ kind: "page", item: toItem(page) }));
    const items = visible(entry.pages).map(toItem);
    if (items.length <= 2) return items.map((item) => ({ kind: "page", item }));
    return [
      {
        kind: "section",
        section: {
          label: entry.label,
          hint: entry.hint,
          icon: entry.icon,
          items,
          current: items.some((item) => item.current),
          needsAttention: items.some((item) => item.count > 0),
        },
      },
    ];
  };
  // a line only between two visible parts: never first, last or doubled once hidden pages are gone
  const main = chosen
    .flatMap(toEntries)
    .filter(
      (entry, index, all) =>
        entry.kind !== "divider" || (index > 0 && index < all.length - 1 && all[index - 1].kind !== "divider")
    );
  const sections = main.flatMap((entry) => (entry.kind === "section" ? [entry.section] : []));
  const currentSection = sections.find((section) => section.current)?.label ?? null;

  // the open panel follows the current page
  const [openLabel, setOpenLabel] = useState<string | null>(currentSection);
  // a new page or tab may belong to another section
  const location = `${pathname}?${openTab ?? ""}`;
  const [openFor, setOpenFor] = useState(location);
  if (openFor !== location) {
    setOpenFor(location);
    setOpenLabel(currentSection);
  }
  const openSection = sections.find((section) => section.label === openLabel) ?? null;

  // desktop jumps to the section's first page; the drawer only opens (navigating closes it)
  const open = (section: SidebarSection) => {
    setOpenLabel(section.label);
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    if (isDesktop && !section.current && section.items[0]) navigate(section.items[0].href);
  };

  return {
    isCollapsed: useLayoutStore((state) => state.isCollapsed),
    isMobileOpen: useLayoutStore((state) => state.isSidebarOpen),
    main,
    openSection,
    open,
    back: () => setOpenLabel(null),
  };
};
