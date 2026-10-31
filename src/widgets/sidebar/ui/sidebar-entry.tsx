import { ComponentType, ReactNode, SVGProps } from "react";
import { Link, NavLink } from "react-router-dom";
import { LockClosedIcon } from "@heroicons/react/20/solid";

import { cn } from "@/shared/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/kit/tooltip";
import { panelMotion, revealMotion } from "@/shared/lib/sidebar-motion";

interface SidebarEntryProps {
  name: string;
  hint: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  isCollapsed: boolean;
  // a page link, or a button such as More and Back
  href?: string;
  onClick?: () => void;
  // a button's own active state; links work theirs out from the route
  active?: boolean;
  // set for links that point at a tab, where the route alone can't tell
  current?: boolean;
  count?: number;
  // a small dot on the icon, e.g. a section when a page in it needs attention
  dot?: boolean;
  trailing?: ReactNode;
  // its module isn't in the school's package
  locked?: boolean;
  // off-screen in the sliding panel, so it is skipped by the keyboard
  inactive?: boolean;
  openHint: string | null;
  setOpenHint: (name: string | null) => void;
}

// collapsed rows are a 36px square around the icon, the same size as the logo tile above
const rowClass = (isCollapsed: boolean, active: boolean) =>
  cn(
    "group flex items-center rounded-md text-sm font-medium transition-[padding]",
    panelMotion(isCollapsed),
    isCollapsed ? "mx-auto h-9 w-9 justify-center p-0" : "w-full py-2 pl-3 pr-3",
    active ? "bg-gray-100 text-primary-600" : "text-gray-600 hover:bg-gray-50 hover:text-primary-600"
  );

const SidebarEntry = ({
  name,
  hint,
  icon: Icon,
  isCollapsed,
  href,
  onClick,
  active = false,
  current,
  count = 0,
  dot = false,
  trailing,
  locked = false,
  inactive = false,
  openHint,
  setOpenHint,
}: SidebarEntryProps) => {
  const body = (isActive: boolean) => (
    <>
      <span className="relative flex-shrink-0">
        <Icon
          className={cn("h-5 w-5", isActive ? "text-primary-600" : "text-gray-400 group-hover:text-primary-600")}
          aria-hidden="true"
        />
        {(dot || (isCollapsed && count > 0)) && (
          <span
            className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"
            aria-hidden="true"
          />
        )}
      </span>
      <span
        className={cn(
          "min-w-0 overflow-hidden whitespace-nowrap text-left",
          revealMotion(isCollapsed),
          isCollapsed ? "ml-0 hidden max-w-0" : "ml-3 max-w-[10rem]"
        )}
      >
        <span className="block truncate">{name}</span>
      </span>
      {!isCollapsed && count > 0 && (
        <span
          className="ml-auto rounded-full bg-red-50 px-1.5 py-0.5 text-xs font-semibold text-red-600"
          aria-label={`${count} waiting`}
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
      {!isCollapsed && locked && (
        <LockClosedIcon className="ml-auto h-3.5 w-3.5 text-gray-400" aria-label="Not in your package" />
      )}
      {!isCollapsed && !count && !locked && trailing && (
        <span className="ml-auto opacity-60 transition-transform group-hover:translate-x-0.5">{trailing}</span>
      )}
    </>
  );

  return (
    <Tooltip
      open={isCollapsed && openHint === name}
      onOpenChange={(open) => setOpenHint(open && isCollapsed ? name : null)}
    >
      {/* plain wrapper: Slot breaks NavLink's className function */}
      <TooltipTrigger asChild>
        <div>
          {href && current !== undefined ? (
            // the caller knows if it's current (tab links too); NavLink would mark every tab of a page
            <Link
              to={href}
              tabIndex={inactive ? -1 : undefined}
              aria-current={current ? "page" : undefined}
              className={rowClass(isCollapsed, current)}
            >
              {body(current)}
            </Link>
          ) : href ? (
            <NavLink
              to={href}
              tabIndex={inactive ? -1 : undefined}
              className={({ isActive }) => rowClass(isCollapsed, isActive)}
            >
              {({ isActive }) => body(isActive)}
            </NavLink>
          ) : (
            <button
              type="button"
              onClick={onClick}
              tabIndex={inactive ? -1 : undefined}
              aria-current={active ? "true" : undefined}
              className={rowClass(isCollapsed, active)}
            >
              {body(active)}
            </button>
          )}
        </div>
      </TooltipTrigger>
      {/* name and a one-line hint, only while the sidebar is collapsed */}
      <TooltipContent side="right" sideOffset={14}>
        <p className="font-semibold text-gray-900">{name}</p>
        <p className="mt-0.5 text-gray-500">{locked ? `${hint} · not in your package` : hint}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default SidebarEntry;
