const YEAR_PATTERN = /\d{4}(?:-\d{2,4})?/g;

const addYearToDate = (isoDate: string) => {
  const date = new Date(`${isoDate.slice(0, 10)}T00:00:00Z`);
  date.setUTCFullYear(date.getUTCFullYear() + 1);
  return date.toISOString().slice(0, 10);
};

// "2026-27" becomes "2027-28", "2026-2027" becomes "2027-2028", "2026" becomes "2027"; a name with no year in it is left for the person to type
const nextYearName = (name: string) =>
  YEAR_PATTERN.test(name)
    ? name.replace(YEAR_PATTERN, (match) => {
        const [start, end] = match.split("-");
        const nextStart = Number(start) + 1;
        if (!end) return String(nextStart);
        return `${nextStart}-${end.length === 2 ? String((Number(end) + 1) % 100).padStart(2, "0") : String(Number(end) + 1)}`;
      })
    : "";

// what to pre-fill when starting the year after `year`: the same name and dates, one year on
export const suggestNextYear = (year: { name: string; startDate: string; endDate: string }) => {
  YEAR_PATTERN.lastIndex = 0;
  const name = nextYearName(year.name);
  YEAR_PATTERN.lastIndex = 0;
  return { name, startDate: addYearToDate(year.startDate), endDate: addYearToDate(year.endDate) };
};
