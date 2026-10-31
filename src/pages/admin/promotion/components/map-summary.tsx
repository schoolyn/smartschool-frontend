import { IPromotionSectionStats } from "@/entities/promotion";

interface MapSummaryProps {
  rows: { sections: { stats?: IPromotionSectionStats }[] }[];
}

// the year's promotion progress in one line: students moved, and sections finished
const MapSummary = ({ rows }: MapSummaryProps) => {
  const sections = rows.flatMap((row) => row.sections);
  const moved = sections.reduce((sum, { stats }) => sum + (stats?.moved ?? 0), 0);
  const waiting = sections.reduce((sum, { stats }) => sum + (stats?.waiting ?? 0), 0);
  const filled = sections.filter(({ stats }) => (stats?.moved ?? 0) + (stats?.waiting ?? 0) > 0);
  const done = filled.filter(({ stats }) => !stats?.waiting).length;
  const share = moved + waiting ? Math.round((moved / (moved + waiting)) * 100) : 0;

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow sm:flex-row sm:items-center sm:gap-6">
      <div className="flex-1">
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-medium text-gray-900">
            {moved} of {moved + waiting} student(s) moved
          </p>
          <p className="text-sm font-semibold text-gray-900">{share}%</p>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${share}%` }} />
        </div>
      </div>
      <p className="text-sm text-gray-500 sm:w-48 sm:text-right">
        {done} of {filled.length} section(s) done
      </p>
    </div>
  );
};

export default MapSummary;
