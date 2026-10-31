import { cn } from "@/shared/lib/utils";
import { ICalendarEntry } from "@/entities/calendar";
import { buildMonthWeeks, CalendarItemKind, GridItem, KIND_STYLES } from "../calendar.utils";

const DAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MAX_CHIPS = 3;

interface MonthGridProps {
  year: number;
  month: number;
  today: string;
  itemsByDate: Map<string, GridItem[]>;
  onPickDay?: (date: string) => void;
  onPickEntry?: (entry: ICalendarEntry) => void;
}

const MonthGrid = ({ year, month, today, itemsByDate, onPickDay, onPickEntry }: MonthGridProps) => (
  <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
    <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
      {DAY_HEADERS.map((day) => (
        <div key={day} className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
          {day}
        </div>
      ))}
    </div>
    {buildMonthWeeks(year, month).map((week) => (
      <div key={week[0].date} className="grid grid-cols-7">
        {week.map(({ date, inMonth }) => {
          const items = itemsByDate.get(date) ?? [];
          const isHoliday = items.some((item) => item.kind === "holiday");
          const shown = items.slice(0, MAX_CHIPS);
          return (
            <div
              key={date}
              onClick={() => onPickDay?.(date)}
              className={cn(
                "min-h-[104px] border-b border-r border-gray-100 p-1.5 transition-colors",
                onPickDay && "cursor-pointer hover:bg-gray-50",
                !inMonth && "bg-gray-50/60 text-gray-300 dark:bg-white/[0.02] dark:text-gray-600",
                inMonth && isHoliday && "bg-red-50/50 dark:bg-red-500/10"
              )}
            >
              <div className="flex justify-end">
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-sm",
                    date === today
                      ? "bg-primary-600 font-semibold text-white"
                      : inMonth
                        ? "text-gray-700"
                        : "text-gray-300 dark:text-gray-600"
                  )}
                >
                  {Number(date.slice(8))}
                </span>
              </div>
              <div className="mt-1 space-y-1">
                {shown.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    title={item.title}
                    disabled={!item.entry || !onPickEntry}
                    onClick={(event) => {
                      event.stopPropagation();
                      if (item.entry) onPickEntry?.(item.entry);
                    }}
                    className={cn(
                      "block w-full truncate rounded border px-1.5 py-0.5 text-left text-[11px] font-medium disabled:cursor-default",
                      KIND_STYLES[item.kind].chip
                    )}
                  >
                    {item.title}
                  </button>
                ))}
                {items.length > MAX_CHIPS && (
                  <p className="px-1 text-[11px] text-gray-500">+{items.length - MAX_CHIPS} more</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    ))}
    <div className="flex flex-wrap gap-x-5 gap-y-1 px-4 py-3 text-xs text-gray-500">
      {(Object.keys(KIND_STYLES) as CalendarItemKind[]).map((kind) => (
        <span key={kind} className="flex items-center gap-1.5">
          <span className={cn("h-2 w-2 rounded-full", KIND_STYLES[kind].dot)} />
          {KIND_STYLES[kind].label}
        </span>
      ))}
    </div>
  </div>
);

export default MonthGrid;
