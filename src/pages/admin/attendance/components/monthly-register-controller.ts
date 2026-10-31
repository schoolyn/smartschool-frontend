import { useMemo, useState } from "react";

import { exportToCsv } from "@/shared/lib";
import { useGetMonthRegister } from "@/entities/attendance";
import { MARKS, SUMMARY_COLUMNS } from "./monthly-register-columns";

const useMonthlyRegisterController = (
  organizationId: string,
  sectionId: string,
  month: string,
  sectionLabel: string
) => {
  const register = useGetMonthRegister(organizationId, sectionId, month);
  const [search, setSearch] = useState("");
  const [showHolidays, setShowHolidays] = useState(true);

  const allDays = register.data?.days ?? [];
  const days = showHolidays ? allDays : allDays.filter((day) => !day.isHoliday);
  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    const items = register.data?.items ?? [];
    return term ? items.filter((row) => `${row.studentName} ${row.rollNumber}`.toLowerCase().includes(term)) : items;
  }, [register.data, search]);

  // the register already holds the whole month, so the file is built here
  const exportCsv = () =>
    exportToCsv(
      `attendance-${sectionLabel.replace(/\s+/g, "-").toLowerCase()}-${month}`,
      rows.map((row) => ({
        roll_number: row.rollNumber,
        student: row.studentName,
        ...Object.fromEntries(
          allDays.map((day) => [
            day.date,
            row.cells[day.date] ? MARKS[row.cells[day.date]].letter : day.isHoliday ? "H" : "",
          ])
        ),
        ...Object.fromEntries(SUMMARY_COLUMNS.map((column) => [column.key, row.summary[column.key]])),
        attendance_percent: row.summary.percent,
      }))
    );

  return {
    days,
    rows,
    schoolDays: register.data?.schoolDays,
    isLoading: register.isLoading,
    error: register.isError ? register.error : null,
    retry: () => register.refetch(),
    search,
    setSearch,
    showHolidays,
    setShowHolidays,
    exportCsv,
  };
};

export default useMonthlyRegisterController;
