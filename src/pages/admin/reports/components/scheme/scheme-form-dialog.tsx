import { TrashIcon } from "@heroicons/react/24/outline";

import FormDialog from "@/shared/ui/form-dialog";
import { TextField } from "@/shared/ui/form-fields";
import { Button } from "@/shared/ui/kit/button";
import { IGradingScheme } from "@/entities/exam";
import useSchemeFormDialogController from "./scheme-form-dialog-controller";

interface SchemeFormDialogProps {
  organizationId: string;
  scheme?: IGradingScheme;
  open: boolean;
  onClose: () => void;
}

// a grading scheme: grades by the percentage each starts at, and the pass mark
const SchemeFormDialog = (props: SchemeFormDialogProps) => {
  const c = useSchemeFormDialogController(props);
  const { form } = c;

  return (
    <FormDialog
      form={form}
      open={props.open}
      onClose={props.onClose}
      title={c.isEdit ? "Edit grading scheme" : "Create grading scheme"}
      description="Each grade starts at a percentage and runs up to the next grade. Results already published keep the grades they were given."
      submitLabel={c.isEdit ? "Save changes" : "Create scheme"}
      isSubmitting={c.isSaving}
      onSubmit={c.onSubmit}
      className="max-w-2xl"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr]">
        <TextField form={form} name="name" label="Scheme name" placeholder="CBSE 9-point" autoFocus />
        <TextField form={form} name="passPercent" label="Pass mark (%)" type="number" min={0} max={100} />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">Grades</p>
        <Button variant="secondary" size="sm" onClick={c.fillCbse}>
          Use CBSE 9-point scale
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200">
        <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3 border-b border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-500">
          <span>Grade</span>
          <span>Starts at (%)</span>
          <span>Grade point</span>
          <span>Covers</span>
          <span className="w-9" />
        </div>
        <div className="divide-y divide-gray-100">
          {c.bands.fields.map((band, index) => (
            <div key={band.id} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] items-start gap-3 px-3 py-2">
              <TextField
                form={form}
                name={`bands.${index}.grade`}
                label="Grade"
                placeholder="A1"
                className="[&_label]:sr-only"
              />
              <TextField
                form={form}
                name={`bands.${index}.minPercent`}
                label="Starts at (%)"
                type="number"
                min={0}
                max={100}
                className="[&_label]:sr-only"
              />
              <TextField
                form={form}
                name={`bands.${index}.gradePoint`}
                label="Grade point"
                type="number"
                min={0}
                className="[&_label]:sr-only"
              />
              <span className="pt-2.5 text-sm text-gray-600">{c.rangeOf(index) || "-"}</span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Remove this grade"
                disabled={c.bands.fields.length === 1}
                onClick={() => c.bands.remove(index)}
              >
                <TrashIcon className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          ))}
        </div>
      </div>
      {c.bandsError && <p className="text-sm text-red-600">{c.bandsError}</p>}
      <Button variant="link" onClick={c.addBand}>
        + Add a grade
      </Button>
    </FormDialog>
  );
};

export default SchemeFormDialog;
