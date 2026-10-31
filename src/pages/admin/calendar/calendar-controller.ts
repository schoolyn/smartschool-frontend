import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { useCan } from "@/entities/session";
import { useError } from "@/shared/lib/hooks";
import { ICalendarEntry } from "@/entities/calendar";
import { localDateString } from "@/shared/lib";
import { EntryFilter } from "./components/events-sidebar";
import { toGridItems } from "./calendar.utils";
import { useDeleteCalendarEntry, useGetCalendarMonth } from "@/entities/calendar";

const useCalendarController = () => {
  const { organizationId = "" } = useParams();
  // teachers and parents see the same calendar, without changing it
  const canEdit = useCan()("calendar.manage");
  const today = localDateString();
  const [cursor, setCursor] = useState(() => ({ year: Number(today.slice(0, 4)), month: Number(today.slice(5, 7)) }));
  const [filter, setFilter] = useState<EntryFilter>("all");
  const [dialog, setDialog] = useState<{ entry: ICalendarEntry | null; date: string } | null>(null);
  const [toDelete, setToDelete] = useState<ICalendarEntry | null>(null);

  const month = useGetCalendarMonth(organizationId, cursor.year, cursor.month);
  const deleteEntry = useDeleteCalendarEntry(organizationId);
  useError({ mutation: deleteEntry });

  const itemsByDate = useMemo(
    () => toGridItems(month.data?.entries ?? [], [...(month.data?.examDays ?? []), ...(month.data?.birthdays ?? [])]),
    [month.data]
  );

  const shift = (by: number) =>
    setCursor(({ year, month: current }) => {
      const next = new Date(year, current - 1 + by, 1);
      return { year: next.getFullYear(), month: next.getMonth() + 1 };
    });

  const label = new Date(cursor.year, cursor.month - 1, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
  const editEntry = (entry: ICalendarEntry) => setDialog({ entry, date: entry.date });

  const confirmDelete = () =>
    toDelete &&
    deleteEntry.mutate(toDelete.id, {
      onSuccess: () => {
        toast.success("Entry deleted.");
        setToDelete(null);
      },
    });

  return {
    organizationId,
    canEdit,
    today,
    cursor,
    label,
    month,
    itemsByDate,
    filter,
    setFilter,
    dialog,
    openAdd: () => setDialog({ entry: null, date: today }),
    pickDay: canEdit ? (date: string) => setDialog({ entry: null, date }) : undefined,
    editEntry: canEdit ? editEntry : undefined,
    closeDialog: () => setDialog(null),
    toDelete,
    askDelete: canEdit ? setToDelete : undefined,
    closeDelete: () => setToDelete(null),
    confirmDelete,
    isDeleting: deleteEntry.isPending,
    previousMonth: () => shift(-1),
    nextMonth: () => shift(1),
    goToday: () => setCursor({ year: Number(today.slice(0, 4)), month: Number(today.slice(5, 7)) }),
  };
};

export default useCalendarController;
