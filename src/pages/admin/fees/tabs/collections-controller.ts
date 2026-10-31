import { useState } from "react";

import { exportToCsv, paymentMethodLabel, todayInIndia } from "@/shared/lib";
import { useGetFeeCollections } from "@/entities/fee";

const useCollectionsController = (organizationId: string) => {
  const [from, setFrom] = useState(() => `${todayInIndia().slice(0, 7)}-01`);
  const [to, setTo] = useState(todayInIndia());
  const rangeIssue =
    !from || !to
      ? "Pick both dates to see collections."
      : (Date.parse(to) - Date.parse(from)) / 86400000 > 366
        ? "Choose a range of one year or less."
        : null;
  const report = useGetFeeCollections(organizationId, rangeIssue ? "" : from, rangeIssue ? "" : to);
  const data = report.data;

  const onExport = () => {
    if (!data) return;
    exportToCsv(`fee-collections-${from}-to-${to}`, [
      ...data.byDay.map((d) => ({ breakdown: "Day", item: d.date, amount_rupees: d.amount / 100, entries: d.count })),
      ...data.byMethod.map((m) => ({
        breakdown: "Method",
        item: paymentMethodLabel(m.method),
        amount_rupees: m.amount / 100,
        entries: m.count,
      })),
      ...data.byClass.map((c) => ({
        breakdown: "Class",
        item: c.className,
        amount_rupees: c.amount / 100,
        entries: c.students,
      })),
    ]);
  };

  return {
    from,
    to,
    setFrom,
    setTo,
    rangeIssue,
    data,
    isError: report.isError,
    error: report.error,
    retry: () => report.refetch(),
    onExport,
  };
};

export default useCollectionsController;
