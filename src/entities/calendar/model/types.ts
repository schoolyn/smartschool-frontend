export type CalendarEntryType = "holiday" | "half_day" | "event";

export interface ICalendarEntry {
  id: string;
  title: string;
  type: CalendarEntryType;
  date: string;
  recurring: boolean;
  startDate: string;
  dayOfWeek?: number;
}

export interface ICalendarAutoItem {
  title: string;
  type: "exam" | "birthday";
  who?: "student" | "staff";
  date: string;
}

export interface ICalendarMonth {
  entries: ICalendarEntry[];
  examDays: ICalendarAutoItem[];
  birthdays: ICalendarAutoItem[];
}

export interface ICalendarRule {
  id: string;
  title: string;
  type: CalendarEntryType;
  date: string;
  recurrence?: { frequency: "weekly"; dayOfWeek: number };
}
