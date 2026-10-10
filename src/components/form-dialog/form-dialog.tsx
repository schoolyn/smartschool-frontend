import { FormEventHandler, ReactNode } from "react";
import { FieldValues, UseFormReturn } from "react-hook-form";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import ButtonSpinner from "@/icons/button-spinner";

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
  children: ReactNode;
}

// the shared create/edit modal: a title, the fields, and Cancel / submit. The form is `noValidate` because the
// screens validate with their own schemas and show per-field messages.
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
  children,
}: FormDialogProps<T>) => (
  <Dialog open={open} onOpenChange={(next) => !next && !isSubmitting && onClose()}>
    <DialogContent showDefaultClose>
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
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || submitDisabled}
              className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 disabled:opacity-50"
            >
              {isSubmitting && <ButtonSpinner />}
              {submitLabel}
            </button>
          </div>
        </form>
      </Form>
    </DialogContent>
  </Dialog>
);

export default FormDialog;
