import { FormEventHandler, ReactNode } from "react";
import { FieldValues, UseFormReturn } from "react-hook-form";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/shared/ui/kit/dialog";
import { Form } from "@/shared/ui/kit/form";
import { Button } from "@/shared/ui/kit/button";

interface FormDialogProps<T extends FieldValues> {
  // the react-hook-form instance behind the fields, shared with them through the form provider
  form: UseFormReturn<T>;
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  submitLabel: string;
  isSubmitting?: boolean;
  // blocks only the submit button, for example while data it depends on is still loading
  submitDisabled?: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  // width override, for example "max-w-md" or "max-w-2xl"
  className?: string;
  children: ReactNode;
}

// the shared create/edit modal; `noValidate` because screens validate with their own schemas
const FormDialog = <T extends FieldValues>({
  form,
  open,
  onClose,
  title,
  description,
  submitLabel,
  isSubmitting = false,
  submitDisabled = false,
  onSubmit,
  className,
  children,
}: FormDialogProps<T>) => (
  <Dialog open={open} onOpenChange={(next) => !next && !isSubmitting && onClose()}>
    <DialogContent showDefaultClose className={className}>
      <Form {...form}>
        <form onSubmit={onSubmit} noValidate className="flex min-h-0 flex-col">
          <div className="space-y-4 overflow-y-auto p-6">
            <div>
              <DialogTitle className="text-lg font-medium text-gray-900">{title}</DialogTitle>
              {description && (
                <DialogDescription className="mt-1 text-sm text-gray-500">{description}</DialogDescription>
              )}
            </div>
            {children}
          </div>
          <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-3">
            <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting} disabled={submitDisabled}>
              {submitLabel}
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  </Dialog>
);

export default FormDialog;
