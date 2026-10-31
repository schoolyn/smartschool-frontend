import FormDialog from "@/shared/ui/form-dialog";
import { DateField, SelectField, TextField } from "@/shared/ui/form-fields";
import { ICalendarEntry } from "@/entities/calendar";
import { SelectOption } from "@/shared/types";
import useEntryDialogController from "./entry-dialog-controller";

const typeOptions: SelectOption[] = [
  { id: "holiday", name: "Day off / Holiday" },
  { id: "half_day", name: "Half day" },
  { id: "event", name: "Full day event" },
];

interface EntryDialogProps {
  organizationId: string;
  entry: ICalendarEntry | null;
  defaultDate: string;
  open: boolean;
  onClose: () => void;
}

const EntryDialog = (props: EntryDialogProps) => {
  const { entry, open, onClose } = props;
  const c = useEntryDialogController(props);

  return (
    <FormDialog
      form={c.form}
      open={open}
      onClose={onClose}
      title={entry ? "Edit entry" : "Add event"}
      description="Holidays are treated as non-school days in attendance."
      submitLabel={entry ? "Save" : "Add"}
      isSubmitting={c.isSubmitting}
      onSubmit={c.submit}
      className="max-w-lg"
    >
      <TextField form={c.form} name="title" label="Title" placeholder="Ram Navmi" autoFocus />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectField form={c.form} name="type" label="Type" options={typeOptions} />
        <DateField form={c.form} name="date" label={entry?.recurring ? "Starts on" : "Date"} />
      </div>
      <SelectField form={c.form} name="repeat" label="Repeat" options={c.repeatOptions} />
    </FormDialog>
  );
};

export default EntryDialog;
