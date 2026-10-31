import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { useError } from "@/shared/lib/hooks";
import { ICalendarEntry } from "@/entities/calendar";
import { SelectOption } from "@/shared/types";
import { calendarEntrySchema, CalendarEntryFormValues, defaultCalendarEntryValues } from "../calendar.schema";
import { WEEKDAYS, weekdayOf } from "../calendar.utils";
import { useSaveCalendarEntry } from "@/entities/calendar";

interface EntryDialogControllerArgs {
  organizationId: string;
  entry: ICalendarEntry | null;
  defaultDate: string;
  open: boolean;
  onClose: () => void;
}

const useEntryDialogController = ({ organizationId, entry, defaultDate, open, onClose }: EntryDialogControllerArgs) => {
  const save = useSaveCalendarEntry(organizationId);
  useError({ mutation: save });

  const form = useForm<CalendarEntryFormValues>({
    resolver: zodResolver(calendarEntrySchema),
    defaultValues: defaultCalendarEntryValues,
  });
  const date = useWatch({ control: form.control, name: "date" });

  useEffect(() => {
    if (!open) return;
    form.reset(
      entry
        ? { title: entry.title, type: entry.type, date: entry.startDate, repeat: entry.recurring ? "weekly" : "none" }
        : { ...defaultCalendarEntryValues, date: defaultDate }
    );
  }, [open, entry, defaultDate, form]);

  const repeatOptions: SelectOption[] = [
    { id: "none", name: "Does not repeat" },
    { id: "weekly", name: date ? `Every ${WEEKDAYS[weekdayOf(date)]}` : "Every week" },
  ];

  const submit = form.handleSubmit((values) => {
    save.mutate(
      {
        id: entry?.id,
        title: values.title,
        type: values.type,
        date: values.date,
        recurrence: values.repeat === "weekly" ? { frequency: "weekly", dayOfWeek: weekdayOf(values.date) } : null,
      },
      {
        onSuccess: () => {
          toast.success(entry ? "Entry updated." : "Entry added.");
          onClose();
        },
      }
    );
  });

  return { form, repeatOptions, submit, isSubmitting: save.isPending };
};

export default useEntryDialogController;
