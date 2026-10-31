import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { RowMenuItem } from "@/shared/ui/row-menu";
import { useMutationFeedback } from "@/shared/lib/hooks";
import { IAcademicYear } from "@/entities/academics";
import { useCreateAcademicYear, useGetAcademicYears, useUpdateAcademicYear } from "@/entities/academics";
import { defaultYearFormValues, yearFormSchema, YearFormValues } from "../classes.schema";

export type YearAction = "current" | "close" | "reopen";

const useYearsTabController = (organizationId: string) => {
  const years = useGetAcademicYears(organizationId);
  const createYear = useCreateAcademicYear(organizationId);
  const updateYear = useUpdateAcademicYear(organizationId);

  const [dialog, setDialog] = useState<{ year?: IAcademicYear } | null>(null);
  const [pending, setPending] = useState<{ action: YearAction; year: IAcademicYear } | null>(null);
  const [rolloverFrom, setRolloverFrom] = useState<IAcademicYear | null>(null);

  const form = useForm<YearFormValues>({ resolver: zodResolver(yearFormSchema), defaultValues: defaultYearFormValues });

  useEffect(() => {
    if (!dialog) return;
    const year = dialog.year;
    form.reset(
      year
        ? {
            name: year.name,
            startDate: year.startDate.slice(0, 10),
            endDate: year.endDate.slice(0, 10),
            isCurrent: year.isCurrent,
          }
        : defaultYearFormValues
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialog]);

  const closeAll = () => {
    setDialog(null);
    setPending(null);
  };

  useMutationFeedback(createYear, "Academic year created", closeAll);
  useMutationFeedback(updateYear, "Academic year updated", closeAll);

  const submit = form.handleSubmit((values) => {
    if (dialog?.year) {
      updateYear.mutate({
        id: dialog.year.id,
        name: values.name,
        startDate: values.startDate,
        endDate: values.endDate,
      });
    } else {
      createYear.mutate(values);
    }
  });

  const confirm = () => {
    if (!pending) return;
    const { action, year } = pending;
    updateYear.mutate(
      action === "current"
        ? { id: year.id, isCurrent: true }
        : { id: year.id, status: action === "close" ? "closed" : "active" }
    );
  };

  const menuFor = (year: IAcademicYear): RowMenuItem[] => [
    { label: "Edit", onSelect: () => setDialog({ year }) },
    { label: "Start next year from this one", onSelect: () => setRolloverFrom(year) },
    ...(!year.isCurrent && year.status !== "closed"
      ? [{ label: "Set as current", onSelect: () => setPending({ action: "current" as const, year }) }]
      : []),
    ...(!year.isCurrent && year.status !== "closed"
      ? [{ label: "Close year", onSelect: () => setPending({ action: "close" as const, year }), danger: true }]
      : []),
    ...(year.status === "closed"
      ? [{ label: "Reopen year", onSelect: () => setPending({ action: "reopen" as const, year }) }]
      : []),
  ];

  const items = years.data?.items ?? [];

  return {
    items,
    isLoading: years.isLoading,
    form,
    dialog,
    openAdd: () => setDialog({}),
    closeDialog: () => setDialog(null),
    submit,
    isSubmitting: createYear.isPending || updateYear.isPending,
    pending,
    closePending: () => setPending(null),
    confirm,
    isUpdating: updateYear.isPending,
    rolloverFrom,
    startNextYear: () => setRolloverFrom(items.find((year) => year.isCurrent) ?? items[0]),
    closeRollover: () => setRolloverFrom(null),
    menuFor,
  };
};

export default useYearsTabController;
