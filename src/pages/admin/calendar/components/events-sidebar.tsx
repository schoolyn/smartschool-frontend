import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/kit/tabs";
import RowMenu from "@/shared/ui/row-menu";
import { cn } from "@/shared/lib/utils";
import { ICalendarEntry } from "@/entities/calendar";
import { formatDay, KIND_STYLES, WEEKDAYS } from "../calendar.utils";
import EmptyState from "@/shared/ui/empty-state";

export type EntryFilter = "all" | "holiday" | "event";

const FILTERS: { id: EntryFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "holiday", label: "Holiday" },
  { id: "event", label: "Event" },
];

const BORDERS = { holiday: "border-b-red-500", half_day: "border-b-amber-400", event: "border-b-emerald-500" };

interface EventsSidebarProps {
  entries: ICalendarEntry[];
  filter: EntryFilter;
  onFilter: (filter: EntryFilter) => void;
  onEdit?: (entry: ICalendarEntry) => void;
  onDelete?: (entry: ICalendarEntry) => void;
}

const matches = (entry: ICalendarEntry, filter: EntryFilter) =>
  filter === "all" || (filter === "holiday" ? entry.type === "holiday" : entry.type !== "holiday");

const EventsSidebar = ({ entries, filter, onFilter, onEdit, onDelete }: EventsSidebarProps) => {
  const rules = [...new Map(entries.map((entry) => [entry.id, entry])).values()].filter((entry) =>
    matches(entry, filter)
  );

  return (
    <aside className="flex flex-col rounded-lg border border-gray-200 bg-white">
      <div className="flex justify-center border-b border-gray-100 p-3">
        <Tabs value={filter} onValueChange={(value) => onFilter(value as EntryFilter)}>
          <TabsList>
            {FILTERS.map((item) => (
              <TabsTrigger key={item.id} value={item.id}>
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <div className={cn("flex-1 space-y-2 p-3", rules.length === 0 && "flex items-center justify-center")}>
        {rules.length === 0 && <EmptyState compact title="Nothing this month" />}
        {rules.map((entry) => (
          <div
            key={entry.id}
            className={cn(
              "flex items-start justify-between rounded-md border border-gray-200 border-b-2 p-3",
              BORDERS[entry.type]
            )}
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">{entry.title}</p>
              <p className="mt-0.5 text-xs text-gray-500">
                {entry.recurring ? `Every ${WEEKDAYS[entry.dayOfWeek ?? 0]}` : formatDay(entry.date)} ·{" "}
                {KIND_STYLES[entry.type].label}
              </p>
            </div>
            {onEdit && onDelete && (
              <RowMenu
                items={[
                  { label: "Edit", onSelect: () => onEdit(entry) },
                  { label: "Delete", onSelect: () => onDelete(entry), danger: true },
                ]}
              />
            )}
          </div>
        ))}
      </div>
    </aside>
  );
};

export default EventsSidebar;
