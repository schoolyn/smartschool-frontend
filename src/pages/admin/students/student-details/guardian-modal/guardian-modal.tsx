import FormDialog from "@/shared/ui/form-dialog";
import { CheckboxField, SelectField, TextField } from "@/shared/ui/form-fields";
import { IAddGuardianValue } from "@/entities/student";
import { SelectOption } from "@/shared/types";
import useGuardianModalController from "./guardian-modal-controller";

const relationshipOptions: SelectOption[] = [
  { id: "FATHER", name: "Father" },
  { id: "MOTHER", name: "Mother" },
  { id: "GUARDIAN", name: "Guardian" },
  { id: "OTHER", name: "Other" },
];

interface GuardianModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (value: IAddGuardianValue) => void;
}

const GuardianModal = ({ isOpen, isSubmitting, onClose, onSubmit }: GuardianModalProps) => {
  const { form, submit } = useGuardianModalController(isOpen, onSubmit);

  return (
    <FormDialog
      form={form}
      open={isOpen}
      onClose={onClose}
      title="Add Guardian"
      submitLabel="Save"
      isSubmitting={isSubmitting}
      onSubmit={submit}
    >
      <TextField form={form} name="parentEmail" label="Email" type="email" autoFocus />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField form={form} name="parentName" label="Name" />
        <TextField form={form} name="phoneNumber" label="Phone" />
      </div>
      <SelectField form={form} name="relationshipType" label="Relationship" options={relationshipOptions} />
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <CheckboxField form={form} name="isPrimaryGuardian" label="Primary guardian" />
        <CheckboxField form={form} name="isEmergencyContact" label="Emergency contact" />
        <CheckboxField form={form} name="canPickup" label="Can pick up" />
      </div>
    </FormDialog>
  );
};

export default GuardianModal;
