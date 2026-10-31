import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import FormDialog from "@/shared/ui/form-dialog";
import { TextField } from "@/shared/ui/form-fields";

const prefixSchema = z.object({
  prefix: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{1,8}$/, "Use 1 to 8 letters or digits."),
});

interface PrefixDialogProps {
  open: boolean;
  prefix: string;
  isSaving: boolean;
  onClose: () => void;
  onSave: (prefix: string) => void;
}

// the start of every generated admission number, e.g. SIS in SIS/2026/0001
const PrefixDialog = ({ open, prefix, isSaving, onClose, onSave }: PrefixDialogProps) => {
  const form = useForm<z.infer<typeof prefixSchema>>({
    resolver: zodResolver(prefixSchema),
    defaultValues: { prefix },
  });
  useEffect(() => {
    if (open) form.reset({ prefix });
  }, [open, prefix, form]);

  return (
    <FormDialog
      form={form}
      open={open}
      onClose={onClose}
      title="Admission number format"
      description="Numbers are the prefix, the admission year and a running count. Numbers already given keep their format."
      submitLabel="Save"
      isSubmitting={isSaving}
      onSubmit={form.handleSubmit((values) => onSave(values.prefix))}
      className="max-w-md"
    >
      <TextField form={form} name="prefix" label="Prefix" placeholder="SIS" autoFocus />
    </FormDialog>
  );
};

export default PrefixDialog;
