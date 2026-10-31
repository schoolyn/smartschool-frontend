import FormDialog from "@/shared/ui/form-dialog";
import { FileField, SelectField, TextField, TextareaField } from "@/shared/ui/form-fields";
import { TOPIC_OPTIONS } from "@/entities/support";
import type { NewSupportRequestValues } from "@/entities/support";
import useSupportDialogController from "../model/support-dialog-controller";

interface SupportDialogProps {
  open: boolean;
  onClose: () => void;
  // starting values, e.g. a request to unlock a module
  prefill?: Partial<NewSupportRequestValues>;
}

const SupportDialog = ({ open, onClose, prefill }: SupportDialogProps) => {
  const { form, submit, isSending } = useSupportDialogController({ open, onClose, prefill });

  return (
    <FormDialog
      form={form}
      open={open}
      onClose={onClose}
      title="Contact Opscul support"
      description="Tell us what's wrong. We reply here and by email, usually within a working day."
      submitLabel="Send request"
      isSubmitting={isSending}
      onSubmit={submit}
    >
      <SelectField form={form} name="topic" label="Topic" options={TOPIC_OPTIONS} />
      <TextField form={form} name="subject" label="Subject" placeholder="e.g. Receipt not showing for a student" />
      <TextareaField
        form={form}
        name="body"
        label="What happened?"
        rows={5}
        placeholder="What you were doing, what you expected, and what happened instead"
      />
      <FileField
        form={form}
        name="screenshot"
        label="Screenshot (optional)"
        accept="image/png,image/jpeg"
        maxBytes={10 * 1024 * 1024}
        hint="PNG or JPG, up to 10 MB"
      />
    </FormDialog>
  );
};

export default SupportDialog;
