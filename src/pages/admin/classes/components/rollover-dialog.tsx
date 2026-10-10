import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import FormDialog from "@/components/form-dialog";
import { Switch } from "@/components/ui/switch";
import { useMutationFeedback } from "@/hooks";
import { IAcademicYear } from "@/types";
import { rolloverFormSchema, RolloverFormValues } from "../classes.schema";
import { suggestNextYear } from "../classes.helpers";
import { useGetRolloverPreview, useRolloverAcademicYear } from "../service/academics-service";
import { SelectField, TextField } from "./form-fields";

interface RolloverDialogProps {
  organizationId: string;
  years: IAcademicYear[];
  // the year to copy from; the dialog is open while this is set
  sourceYear: IAcademicYear | null;
  onClose: () => void;
}

const plural = (count: number, singular: string, many = `${singular}s`) => `${count} ${count === 1 ? singular : many}`;

const CheckRow = ({
  checked,
  disabled,
  onChange,
  label,
  detail,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  detail: string;
}) => (
  <label className={`flex items-start gap-3 text-sm ${disabled ? "text-gray-400" : "text-gray-700"}`}>
    <input
      type="checkbox"
      className="mt-0.5 h-4 w-4 rounded border-gray-300"
      checked={checked && !disabled}
      disabled={disabled}
      onChange={(event) => onChange(event.target.checked)}
    />
    <span>
      <span className="font-medium">{label}</span>
      <span className="block text-xs text-gray-500">{detail}</span>
    </span>
  </label>
);

// "Start next year": pick the year to copy from, name the new one, and see exactly what will be copied before it is
const RolloverDialog = ({ organizationId, years, sourceYear, onClose }: RolloverDialogProps) => {
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
    }),
  );
  const copyClasses = form.watch("copyClasses");
  const copySubjects = form.watch("copySubjects");

  return (
    <FormDialog
      form={form}
      open={!!sourceYear}
      onClose={onClose}
      title="Start next academic year"
      description="Creates the new year and copies this year's setup into it, so you don't have to rebuild it by hand."
      submitLabel={`Start ${form.watch("name") || "new year"}`}
      isSubmitting={rollover.isPending}
      submitDisabled={!counts}
      onSubmit={submit}
    >
      <SelectField
        form={form}
        name="sourceYearId"
        label="Copy from"
        onValueChange={onSourceChange}
        options={years.map((year) => ({ id: year.id, name: year.isCurrent ? `${year.name} (current)` : year.name }))}
      />
      <TextField form={form} name="name" label="New year name" placeholder="2027-28" />
      <div className="grid grid-cols-2 gap-4">
        <TextField form={form} name="startDate" label="Starts" type="date" />
        <TextField form={form} name="endDate" label="Ends" type="date" />
      </div>

      <div className="space-y-3 rounded-md border border-gray-200 bg-gray-50 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          What gets copied from {source?.name ?? "this year"}
        </p>
        <CheckRow
          label="Classes and sections"
          detail={countsDetail(
            (c) => `${plural(c.classes, "class", "classes")} with ${plural(c.sections, "section")} (active ones only)`,
          )}
          checked={copyClasses}
          disabled={!counts?.classes}
          onChange={(checked) => form.setValue("copyClasses", checked)}
        />
        <CheckRow
          label="Subjects"
          detail={countsDetail((c) => `${plural(c.subjects, "subject")} (active ones only)`)}
          checked={copySubjects}
          disabled={!counts?.subjects}
          onChange={(checked) => form.setValue("copySubjects", checked)}
        />
        <p className="border-t border-gray-200 pt-3 text-xs text-gray-500">
          Students are not moved here: use Promotion once the new classes exist. Class teachers and teacher assignments
          are not copied, since they usually change.
        </p>
      </div>

      <label className="flex items-center gap-3 text-sm text-gray-700">
        <Switch checked={form.watch("isCurrent")} onCheckedChange={(checked) => form.setValue("isCurrent", checked)} />
        Make the new year the current year now
      </label>
    </FormDialog>
  );
};

export default RolloverDialog;
