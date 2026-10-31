import { z } from "zod";

export const calendarEntrySchema = z.object({
  title: z.string().trim().min(1, "Enter a title."),
  type: z.enum(["holiday", "half_day", "event"]),
  date: z.string().min(1, "Pick a date."),
  repeat: z.enum(["none", "weekly"]),
});
export type CalendarEntryFormValues = z.infer<typeof calendarEntrySchema>;
export const defaultCalendarEntryValues: CalendarEntryFormValues = {
  title: "",
  type: "event",
  date: "",
  repeat: "none",
};
