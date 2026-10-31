import { ICalendarAutoItem, ICalendarEntry } from "@/entities/calendar";
import { localDateString } from "@/shared/lib";

export type CalendarItemKind = "holiday" | "half_day" | "event" | "exam" | "birthday";

export const KIND_STYLES: Record<CalendarItemKind, { label: string; dot: string; chip: string }> = {
  holiday: { label: "Day off / Holiday", dot: "bg-red-500", chip: "border-red-200 bg-red-50 text-red-700" },
  half_day: {
    label: "Half day",
    dot: "bg-amber-400",
    chip: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
  },
  event: {
    label: "Full day event",
    dot: "bg-emerald-500",
    chip: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  },
  exam: {
    label: "Exam",
    dot: "bg-sky-500",
    chip: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300",
  },
  birthday: {
    label: "Birthday",
    dot: "bg-pink-500",
    chip: "border-pink-200 bg-pink-50 text-pink-700 dark:border-pink-500/30 dark:bg-pink-500/10 dark:text-pink-300",
  },
};

export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const parseDate = (date: string) => {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const weekdayOf = (date: string) => parseDate(date).getDay();

export const formatDay = (date: string) =>
  parseDate(date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

// the month as Monday-first weeks, padded with days of the neighbouring months
export const buildMonthWeeks = (year: number, month: number) => {
  const first = new Date(year, month - 1, 1);
  const start = new Date(year, month - 1, 1 - ((first.getDay() + 6) % 7));
  const weeks: { date: string; inMonth: boolean }[][] = [];
  for (let week = 0; week < 6; week += 1) {
    const days = Array.from({ length: 7 }, (_, day) => {
      const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + week * 7 + day);
      return { date: localDateString(date), inMonth: date.getMonth() === month - 1 };
    });
    if (week >= 4 && !days.some((d) => d.inMonth)) break;
    weeks.push(days);
  }
  return weeks;
};

export interface GridItem {
  key: string;
  title: string;
  kind: CalendarItemKind;
  entry?: ICalendarEntry;
}

export const toGridItems = (entries: ICalendarEntry[], autos: ICalendarAutoItem[]) => {
  const byDate = new Map<string, GridItem[]>();
  const add = (date: string, item: GridItem) => byDate.set(date, [...(byDate.get(date) ?? []), item]);
  entries.forEach((entry) =>
    add(entry.date, { key: `${entry.id}-${entry.date}`, title: entry.title, kind: entry.type, entry })
  );
  autos.forEach((item, index) =>
    add(item.date, { key: `${item.type}-${item.date}-${index}`, title: item.title, kind: item.type })
  );
  return byDate;
};
