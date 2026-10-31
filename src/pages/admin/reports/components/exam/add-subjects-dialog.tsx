import { TrashIcon } from "@heroicons/react/24/outline";

import { countLabel } from "@/shared/ui/data-table";
import FormDialog from "@/shared/ui/form-dialog";
import { CheckboxField, SelectField, TextField } from "@/shared/ui/form-fields";
import { Button } from "@/shared/ui/kit/button";
import useAddSubjectsDialogController from "./add-subjects-dialog-controller";

interface AddSubjectsDialogProps {
  organizationId: string;
  academicYearId: string;
  examId: string;
  classId: string;
  className: string;
  addedSubjectIds: string[];
  open: boolean;
  onClose: () => void;
}

// the papers a class sits in this exam, each with its maximum and pass marks
const AddSubjectsDialog = ({ className, ...props }: AddSubjectsDialogProps) => {
  const c = useAddSubjectsDialogController(props);
  const { form } = c;

  return (
    <FormDialog
      form={form}
      open={props.open}
      onClose={props.onClose}
      title={`Add subjects for ${className}`}
      description="Set each subject's maximum and pass marks. A subject with a practical gets a separate practical maximum."
      submitLabel="Add subjects"
      isSubmitting={c.isSaving}
      submitDisabled={!c.available.length}
      onSubmit={c.onSubmit}
      className="max-w-3xl"
    >
      {!c.isLoadingSubjects && !c.available.length ? (
        <p className="rounded-md bg-gray-50 p-4 text-sm text-gray-600">
          Every subject of {className} is already in this exam. Add more subjects on the Academics page first.
        </p>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {countLabel(c.available.length, { one: "subject", other: "subjects" })} available for {className}
            </p>
            <Button variant="secondary" size="sm" onClick={c.addAll} disabled={!c.available.length}>
              Add all {c.available.length}
            </Button>
          </div>

          <div className="space-y-3">
            {c.rows.fields.map((row, index) => (
              <div
                key={row.id}
                className="grid grid-cols-2 items-start gap-3 rounded-lg border border-gray-200 p-3 sm:grid-cols-[2fr_1fr_1fr_auto]"
              >
                <SelectField
                  form={form}
                  name={`rows.${index}.subjectId`}
                  label="Subject"
                  options={c.available}
                  placeholder="Select subject"
                  className="col-span-2 sm:col-span-1"
                />
                <TextField form={form} name={`rows.${index}.maxMarks`} label="Max marks" type="number" min={1} />
                <TextField form={form} name={`rows.${index}.passMarks`} label="Pass marks" type="number" min={0} />
                <Button
                  variant="ghost"
                  size="icon"
                  className="col-span-2 justify-self-end sm:col-span-1 sm:mt-6"
                  aria-label="Remove this subject"
                  disabled={c.rows.fields.length === 1}
                  onClick={() => c.rows.remove(index)}
                >
                  <TrashIcon className="h-4 w-4 text-red-600" />
                </Button>
                <div className="col-span-2 flex flex-wrap items-center gap-4 sm:col-span-4">
                  <CheckboxField form={form} name={`rows.${index}.hasPractical`} label="Has a practical" />
                  {form.watch(`rows.${index}.hasPractical`) && (
                    <TextField
                      form={form}
                      name={`rows.${index}.practicalMaxMarks`}
                      label="Practical max marks"
                      type="number"
                      min={1}
                      className="w-44"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          <Button variant="link" onClick={c.addRow} disabled={c.rows.fields.length >= c.available.length}>
            + Add another subject
          </Button>
        </>
      )}
    </FormDialog>
  );
};

export default AddSubjectsDialog;
