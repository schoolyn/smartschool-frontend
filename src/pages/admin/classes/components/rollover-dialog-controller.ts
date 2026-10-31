import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useMutationFeedback } from "@/shared/lib/hooks";
import { IAcademicYear } from "@/entities/academics";
import { rolloverFormSchema, RolloverFormValues } from "../classes.schema";
import { suggestNextYear } from "../classes.helpers";
import { useGetRolloverPreview, useRolloverAcademicYear } from "@/entities/academics";

interface RolloverDialogControllerArgs {
  organizationId: string;
  years: IAcademicYear[];
  sourceYear: IAcademicYear | null;
  onClose: () => void;
}

const useRolloverDialogController = ({ organizationId, years, sourceYear, onClose }: RolloverDialogControllerArgs) => {
  const rollover = useRolloverAcademicYear(organizationId);
  const form = useForm<RolloverFormValues>({
    resolver: zodResolver(rolloverFormSchema),
    defaultValues: {
      sourceYearId: "",
      name: "",
      startDate: "",
      endDate: "",
      copyClasses: true,
      copySubjects: true,
      isCurrent: false,
    },
  });

  const sourceYearId = form.watch("sourceYearId");
  const source = years.find((year) => year.id === sourceYearId);
  // only fetched while the dialog is open, so reopening it always loads fresh counts
  const preview = useGetRolloverPreview(organizationId, sourceYear ? sourceYearId || undefined : undefined);

  // each time the dialog opens: start from the chosen year, with the next year's name and dates suggested
  useEffect(() => {
    if (!sourceYear) return;
    form.reset({
      sourceYearId: sourceYear.id,
      ...suggestNextYear(sourceYear),
      copyClasses: true,
      copySubjects: true,
      isCurrent: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceYear]);

  // choosing a different year to copy from suggests that year's successor instead
  const onSourceChange = (id: string) => {
    const chosen = years.find((year) => year.id === id);
    if (chosen) form.reset({ ...form.getValues(), sourceYearId: id, ...suggestNextYear(chosen) });
  };

  useMutationFeedback(rollover, "New academic year started", onClose);

  const counts = preview.isFetching ? undefined : preview.data?.counts;
  const countsDetail = (text: (c: NonNullable<typeof counts>) => string) =>
    counts ? text(counts) : preview.isError ? "Could not load what this year has. Close and try again." : "Loading...";

  // a box shown unticked because there is nothing to copy is sent as unticked too
  const submit = form.handleSubmit((values) =>
    rollover.mutate({
      ...values,
      copyClasses: values.copyClasses && !!counts?.classes,
      copySubjects: values.copySubjects && !!counts?.subjects,
    })
  );

  return {
    form,
    source,
    counts,
    countsDetail,
    onSourceChange,
    submit,
    isSubmitting: rollover.isPending,
    yearOptions: years.map((year) => ({ id: year.id, name: year.isCurrent ? `${year.name} (current)` : year.name })),
    copyClasses: form.watch("copyClasses"),
    copySubjects: form.watch("copySubjects"),
  };
};

export default useRolloverDialogController;
