import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useGetStudentAttendanceHistory } from "@/entities/student";
import { useGetMyChildren } from "@/entities/student";

const thisMonth = () => new Date().toISOString().slice(0, 7);

// first and last day of a "YYYY-MM" month
const monthRange = (month: string) => {
  const [year, monthIndex] = month.split("-").map(Number);
  const lastDay = new Date(Date.UTC(year, monthIndex, 0)).getUTCDate();
  return { from: `${month}-01`, to: `${month}-${String(lastDay).padStart(2, "0")}` };
};

const useParentAttendanceController = () => {
  const { organizationId = "" } = useParams();
  const [studentId, setStudentId] = useState("");
  const [month, setMonth] = useState(thisMonth);

  const children = useGetMyChildren(organizationId);
  const { from, to } = monthRange(month);
  const history = useGetStudentAttendanceHistory(organizationId, studentId, from, to);

  useEffect(() => {
    if (!studentId && children.data?.items?.length) setStudentId(children.data.items[0].studentId.id);
  }, [children.data, studentId]);

  const summary = history.data?.summary;
  const attended = summary ? summary.present + summary.late + summary.excused : 0;

  return {
    children: children.data?.items || [],
    studentId,
    setStudentId,
    month,
    setMonth,
    maxMonth: thisMonth(),
    summary,
    percent: summary?.total ? Math.round((attended / summary.total) * 100) : null,
    records: [...(history.data?.items || [])].sort((a, b) => String(b.date).localeCompare(String(a.date))),
    isLoading: history.isLoading,
    loadError: history.isError ? history.error : null,
    retryLoad: () => history.refetch(),
  };
};

export default useParentAttendanceController;
