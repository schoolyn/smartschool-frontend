import { useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";

import { cn } from "@/shared/lib/utils";
import SidebarUserMenu from "./sidebar-user-menu";
import { SidebarSection, useSidebarController } from "../model/sidebar-controller";
import SidebarEntry from "./sidebar-entry";
import { revealMotion } from "@/shared/lib/sidebar-motion";

// main list and one section's panel, sliding side by side
const Sidebar = () => {
  const c = useSidebarController();
  const { isCollapsed, isMobileOpen } = c;
  // one card at a time, and only while collapsed: hovers while expanded are ignored
  const [openHint, setOpenHint] = useState<string | null>(null);
  const entry = { isCollapsed, openHint, setOpenHint };
  const isOpen = !!c.openSection;
  // the panel keeps its section while it slides away
  const lastSection = useRef<SidebarSection | null>(null);
  if (c.openSection) lastSection.current = c.openSection;
  const panel = c.openSection ?? lastSection.current;

  return (
    <div
      className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-350 ease-glide
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:relative lg:z-10 lg:translate-x-0 lg:transition-[width] ${isCollapsed ? "lg:duration-400 lg:ease-settle" : "lg:duration-350 lg:ease-glide"}
        ${isCollapsed ? "lg:w-16" : "lg:w-60"}
        app-shell-surface bg-white border-r border-gray-200 shrink-0 flex flex-col h-full
      `}
    >
      <div className="relative flex-1 overflow-hidden">
        <div
          className={cn(
            "flex h-full w-[200%] transition-transform duration-200 ease-out motion-reduce:transition-none",
            isOpen && "-translate-x-1/2"
          )}
        >
          <nav
            aria-label="Main menu"
            aria-hidden={isOpen}
            className="h-full w-1/2 space-y-1 overflow-y-auto overflow-x-hidden px-2 pb-4 pt-3"
          >
            {c.main.map((item) =>
              item.kind === "divider" ? (
                <div key={item.key} className="!my-3 border-t border-gray-100" aria-hidden="true" />
              ) : item.kind === "page" ? (
                <SidebarEntry key={item.item.href} {...entry} {...item.item} inactive={isOpen} />
              ) : (
                <SidebarEntry
                  key={item.section.label}
                  {...entry}
                  name={item.section.label}
                  hint={item.section.hint}
                  icon={item.section.icon}
                  onClick={() => c.open(item.section)}
                  active={item.section.current}
                  dot={item.section.needsAttention}
                  trailing={<ChevronRightIcon className="h-4 w-4" />}
                  inactive={isOpen}
                />
              )
            )}
          </nav>

          <nav
            aria-label={panel?.label ?? "Section"}
            aria-hidden={!isOpen}
            className="h-full w-1/2 overflow-y-auto overflow-x-hidden px-2 pb-4 pt-3"
          >
            <div
              className={cn(
                "flex items-center gap-3 border-b border-gray-100 pb-3",
                isCollapsed ? "justify-center" : "px-1"
              )}
            >
              <button
                type="button"
                onClick={c.back}
                tabIndex={isOpen ? undefined : -1}
                aria-label="Back to the main menu"
                title="Back to the main menu"
                className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <div
                className={cn(
                  "min-w-0 flex-1 overflow-hidden whitespace-nowrap",
                  revealMotion(isCollapsed),
                  isCollapsed && "hidden"
                )}
              >
                <p className="truncate text-sm font-semibold text-gray-900">{panel?.label}</p>
                <p className="truncate text-xs text-gray-500">{panel?.hint}</p>
              </div>
            </div>

            <div className="space-y-1 pt-3">
              {panel?.items.map((item) => (
                <SidebarEntry key={item.href} {...entry} {...item} inactive={!isOpen} />
              ))}
            </div>
          </nav>
        </div>
      </div>

      <SidebarUserMenu />
    </div>
  );
};

export default Sidebar;
