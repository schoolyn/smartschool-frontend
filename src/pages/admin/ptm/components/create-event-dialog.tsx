import FormDialog from "@/shared/ui/form-dialog";
import { ChipsField, DateField, SelectField, TextField } from "@/shared/ui/form-fields";
import { SelectOption } from "@/shared/types";
import { localDateString } from "@/shared/lib";
import useCreateEventDialogController from "./create-event-dialog-controller";

const modeOptions: SelectOption[] = [
  { id: "onsite", name: "Onsite" },
  { id: "online", name: "Online" },
];

interface CreateEventDialogProps {
  organizationId: string;
  academicYearId?: string;
  sectionOptions: SelectOption[];
  open: boolean;
  onClose: () => void;
}

const CreateEventDialog = ({
  organizationId,
  academicYearId,
  sectionOptions,
  open,
  onClose,
}: CreateEventDialogProps) => {
  const { form, mode, onSubmit, isSubmitting } = useCreateEventDialogController({
    organizationId,
    academicYearId,
    open,
    onClose,
  });

  return (
    <FormDialog
      form={form}
      open={open}
      onClose={onClose}
      title="New PTM Event"
      description="Parents of the chosen sections can book once teachers open their slots."
      submitLabel="Create"
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      className="max-w-2xl"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField form={form} name="title" label="Title" placeholder="Term 1 PTM" autoFocus />
        <DateField form={form} name="date" label="Date" min={localDateString()} />
        <SelectField form={form} name="mode" label="Mode" options={modeOptions} />
        <TextField form={form} name="slotDurationMins" label="Slot duration (mins)" type="number" min={5} max={120} />
        {mode === "onsite" ? (
          <TextField form={form} name="venue" label="Venue" placeholder="School auditorium" className="sm:col-span-2" />
        ) : (
          <TextField
            form={form}
            name="defaultMeetingLink"
            label="Meeting link"
            placeholder="https://meet.google.com/..."
            className="sm:col-span-2"
          />
        )}
      </div>
      <ChipsField
        form={form}
        name="sectionIds"
        label="Sections"
        options={sectionOptions}
        emptyText="No sections found."
      />
    </FormDialog>
  );
};

export default CreateEventDialog;
