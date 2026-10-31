import { countLabel } from "@/shared/ui/data-table";
import FormDialog from "@/shared/ui/form-dialog";
import { Switch } from "@/shared/ui/kit/switch";
import { IAcademicYear } from "@/entities/academics";
import { SelectField, TextField, DateField } from "@/shared/ui/form-fields";
import useRolloverDialogController from "./rollover-dialog-controller";

interface RolloverDialogProps {
  organizationId: string;
  years: IAcademicYear[];
  // the year to copy from; the dialog is open while this is set
  sourceYear: IAcademicYear | null;
  onClose: () => void;
}

const plural = (count: number, one: string, other = `${one}s`) => countLabel(count, { one, other });

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

// "Start next year": pick the year to copy from, name the new one, and preview what will be copied
const RolloverDialog = ({ organizationId, years, sourceYear, onClose }: RolloverDialogProps) => {
  const {
    form,
    source,
    counts,
    countsDetail,
    onSourceChange,
    submit,
    isSubmitting,
    yearOptions,
    copyClasses,
    copySubjects,
  } = useRolloverDialogController({ organizationId, years, sourceYear, onClose });

  return (
    <FormDialog
      form={form}
      open={!!sourceYear}
      onClose={onClose}
      title="Start next academic year"
      description="Creates the new year and copies this year's setup into it, so you don't have to rebuild it by hand."
      submitLabel={`Start ${form.watch("name") || "new year"}`}
      isSubmitting={isSubmitting}
      submitDisabled={!counts}
      onSubmit={submit}
    >
      <SelectField
        form={form}
        name="sourceYearId"
        label="Copy from"
        onValueChange={onSourceChange}
        options={yearOptions}
      />
      <TextField form={form} name="name" label="New year name" placeholder="2027-28" />
      <div className="grid grid-cols-2 gap-4">
        <DateField form={form} name="startDate" label="Starts" />
        <DateField form={form} name="endDate" label="Ends" />
      </div>

      <div className="space-y-3 rounded-md border border-gray-200 bg-gray-50 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          What gets copied from {source?.name ?? "this year"}
        </p>
        <CheckRow
          label="Classes and sections"
          detail={countsDetail(
            (c) => `${plural(c.classes, "class", "classes")} with ${plural(c.sections, "section")} (active ones only)`
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
