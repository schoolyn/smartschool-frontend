import { CheckCircleIcon } from "@heroicons/react/20/solid";

import { cn } from "@/shared/lib/utils";
import { IClass, ISection } from "@/entities/academics";
import { IPromotionSectionStats } from "@/entities/promotion";

interface SchoolMapProps {
  rows: { klass: IClass; sections: { section: ISection; stats?: IPromotionSectionStats }[] }[];
  onOpen: (sectionId: string) => void;
}

const SEGMENTS = [
  { key: "moved", tone: "bg-blue-500", label: "moved" },
  { key: "pass", tone: "bg-green-500", label: "pass" },
  { key: "fail", tone: "bg-red-500", label: "fail" },
  { key: "noResult", tone: "bg-gray-300", label: "no result" },
] as const;

// one tile per section: how many are still waiting and how they did, as a single bar
const SectionTile = ({
  section,
  stats,
  onOpen,
}: {
  section: ISection;
  stats?: IPromotionSectionStats;
  onOpen: () => void;
}) => {
  const total = (stats?.waiting ?? 0) + (stats?.moved ?? 0);
  const done = total > 0 && !stats?.waiting;
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Section ${section.name}`}
      className={cn(
        "w-44 shrink-0 rounded-lg border p-3 text-left transition hover:shadow-md",
        done ? "border-green-200 bg-green-50" : "border-gray-200 bg-white hover:border-primary-300"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900">{section.name}</span>
        {done ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
            <CheckCircleIcon className="h-4 w-4" /> Done
          </span>
        ) : (
          <span className="text-xs text-gray-500">{total ? `${stats?.waiting} waiting` : "Empty"}</span>
        )}
      </div>
      <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-gray-100">
        {total > 0 &&
          SEGMENTS.map(({ key, tone }) => (
            <div key={key} className={tone} style={{ width: `${((stats?.[key] ?? 0) / total) * 100}%` }} />
          ))}
      </div>
      <p className="mt-1.5 truncate text-xs text-gray-500">
        {total
          ? SEGMENTS.filter(({ key }) => stats?.[key])
              .map(({ key, label }) => `${stats?.[key]} ${label}`)
              .join(" · ")
          : "No students"}
      </p>
    </button>
  );
};

// the whole school at a glance: each class a row, each section a tile to open on the board
const SchoolMap = ({ rows, onOpen }: SchoolMapProps) => (
  <div className="divide-y divide-gray-100 rounded-xl bg-white shadow">
    {rows.map(({ klass, sections }) => (
      <div key={klass.id} className="flex items-center gap-4 p-4">
        <div className="w-28 shrink-0">
          <p className="text-sm font-semibold text-gray-900">{klass.name}</p>
          <p className="text-xs text-gray-500">{sections.length} section(s)</p>
        </div>
        <div className="flex min-w-0 flex-1 gap-3 overflow-x-auto pb-1">
          {sections.length ? (
            sections.map(({ section, stats }) => (
              <SectionTile key={section.id} section={section} stats={stats} onOpen={() => onOpen(section.id)} />
            ))
          ) : (
            <p className="text-xs text-gray-500">No sections yet</p>
          )}
        </div>
      </div>
    ))}
  </div>
);

export default SchoolMap;
