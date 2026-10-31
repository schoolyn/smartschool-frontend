import FormDialog from "@/shared/ui/form-dialog";
import { ChipsField, DateField, SelectField, TextField } from "@/shared/ui/form-fields";
import { IExam, IGradingScheme } from "@/entities/exam";
import { SelectOption } from "@/shared/types";
import { EXAM_TYPE_OPTIONS } from "../../exam-ui";
import useExamFormDialogController from "./exam-form-dialog-controller";

interface ExamFormDialogProps {
  organizationId: string;
  academicYearId?: string;
  classOptions: SelectOption[];
  gradingSchemes: IGradingScheme[];
  exam?: IExam;
  open: boolean;
  onClose: () => void;
  onCreated?: (examId: string) => void;
}

// creates an exam, or edits one until its results are published
const ExamFormDialog = ({ classOptions, ...props }: ExamFormDialogProps) => {
  const c = useExamFormDialogController(props);
  const { form } = c;

  return (
    <FormDialog
      form={form}
      open={props.open}
      onClose={props.onClose}
      title={c.isEdit ? "Edit exam" : "Create exam"}
      description={
        c.isEdit
          ? "A class can be removed only while it has no marks entered."
          : "Set the dates and classes. You add each class's subjects on the next screen."
      }
      submitLabel={c.isEdit ? "Save changes" : "Create exam"}
      isSubmitting={c.isSubmitting}
      onSubmit={c.onSubmit}
      className="max-w-2xl"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          form={form}
          name="name"
          label="Exam name"
          placeholder="Unit Test 1"
          autoFocus
          className="sm:col-span-2"
        />
        <SelectField form={form} name="type" label="Type" options={EXAM_TYPE_OPTIONS} />
        <TextField form={form} name="term" label="Term (optional)" placeholder="Term 1" />
        <DateField form={form} name="startDate" label="Starts on" />
        <DateField form={form} name="endDate" label="Ends on" min={form.watch("startDate") || undefined} />
        <SelectField
          form={form}
          name="gradingSchemeId"
          label="Grading scheme"
          options={c.gradingSchemeOptions}
          placeholder={c.hasSchemes ? "Select scheme" : "Create a scheme in Grading Schemes first"}
          disabled={!c.hasSchemes}
          className="sm:col-span-2"
        />
      </div>
      <ChipsField
        form={form}
        name="classIds"
        label="Classes taking this exam"
        options={classOptions}
        emptyText="No classes in the current academic year yet."
      />
    </FormDialog>
  );
};

export default ExamFormDialog;
