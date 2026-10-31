// dates travel as plain "YYYY-MM-DD" strings in local time, never through UTC, so a day never shifts
export const toDate = (value?: string) => {
  if (!value || !/^\d{4}-\d{2}-\d{2}/.test(value)) return undefined;
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day);
};

const pad = (value: number) => String(value).padStart(2, "0");

export const toValue = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const readable = (value: string) =>
  toDate(value)?.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) ?? "";
