import { ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";

import RowMenu, { RowMenuItem } from "@/shared/ui/row-menu";
import { cn } from "@/shared/lib/utils";
import { Lane } from "../promotion.utils";
import { LANE_TONE } from "./lane-tone";

interface BoardLaneProps {
  lane: Lane;
  title: string;
  hint: string;
  count: number;
  menu: RowMenuItem[];
  controls?: ReactNode;
  children: ReactNode;
}

// one column of the board; cards dropped here take its decision
const BoardLane = ({ lane, title, hint, count, menu, controls, children }: BoardLaneProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: lane });
  const tone = LANE_TONE[lane];
  return (
    <section
      ref={setNodeRef}
      aria-label={title}
      className={cn(
        "flex w-72 shrink-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-gray-50 transition-shadow lg:w-auto lg:min-w-[12.5rem] lg:flex-1",
        isOver && `ring-2 ${tone.over}`
      )}
    >
      <div className={cn("h-1", tone.bar)} />
      <header className="space-y-2 border-b border-gray-200 bg-white p-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", tone.count)}>{count}</span>
          <RowMenu label={`${title} options`} className="ml-auto h-7 w-7" items={count ? menu : []} />
        </div>
        <p className="text-xs text-gray-500">{hint}</p>
        {controls}
      </header>
      <div className="min-h-[9rem] flex-1 space-y-2 overflow-y-auto p-2 lg:max-h-[56vh]">
        {count ? (
          children
        ) : (
          <p className="flex h-full min-h-[8rem] items-center justify-center rounded-lg border border-dashed border-gray-300 px-4 text-center text-xs text-gray-500">
            Drop students here
          </p>
        )}
      </div>
    </section>
  );
};

export default BoardLane;
