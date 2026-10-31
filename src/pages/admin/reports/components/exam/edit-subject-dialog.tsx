import FormDialog from "@/shared/ui/form-dialog";
import { CheckboxField, TextField } from "@/shared/ui/form-fields";
import { IExamOverviewSubject } from "@/entities/exam";
import useEditSubjectDialogController from "./edit-subject-dialog-controller";

interface EditSubjectDialogProps {
  organizationId: string;
  // the subject being edited; null = closed
  subject: IExamOverviewSubject | null;
  onClose: () => void;
}

const subjectName = (subject: IExamOverviewSubject | null) =>
  subject && typeof subject.subjectId === "object" ? subject.subjectId.name : "subject";

// a subject's marks; the server keeps any maximum from dropping below marks already given
const EditSubjectDialog = ({ organizationId, subject, onClose }: EditSubjectDialogProps) => {
  const c = useEditSubjectDialogController(organizationId, subject, onClose);

  return (
    <FormDialog
      form={c.form}
      open={!!subject}
      onClose={onClose}
      title={`Edit ${subjectName(subject)}`}
      description={
        subject?.entered
          ? "Marks are already entered, so a maximum can't go below the highest mark given."
          : "Change the maximum and pass marks for this paper."
      }
      submitLabel="Save changes"
      isSubmitting={c.isSaving}
      onSubmit={c.onSubmit}
      className="max-w-md"
    >
      <div className="grid grid-cols-2 gap-4">
        <TextField form={c.form} name="maxMarks" label="Max marks" type="number" min={1} autoFocus />
        <TextField form={c.form} name="passMarks" label="Pass marks" type="number" min={0} />
      </div>
      <CheckboxField form={c.form} name="hasPractical" label="Has a practical" />
      {c.form.watch("hasPractical") && (
        <TextField form={c.form} name="practicalMaxMarks" label="Practical max marks" type="number" min={1} />
      )}
    </FormDialog>
  );
};

export default EditSubjectDialog;
