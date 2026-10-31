import { ITimetableSlot } from "@/entities/timetable";

export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Monday first; Sunday only when something is scheduled on it
export const weekDays = (slots: ITimetableSlot[]) => [
  1,
  2,
  3,
  4,
  5,
  6,
  ...(slots.some((slot) => slot.dayOfWeek === 0) ? [0] : []),
];

// one row per distinct period time, in the order of the day
export const periodRows = (slots: ITimetableSlot[]) =>
  [...new Set(slots.map((slot) => `${slot.startTime}-${slot.endTime}`))].sort();

export const formatTime = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};
