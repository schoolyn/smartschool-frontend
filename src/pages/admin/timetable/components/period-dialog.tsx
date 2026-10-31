import FormDialog from "@/shared/ui/form-dialog";
import { ChipsField, SelectField, TextField } from "@/shared/ui/form-fields";
import { ISubject, ITeacherAssignment } from "@/entities/academics";
import { SelectOption } from "@/shared/types";
import { DAY_NAMES } from "../timetable.utils";
import usePeriodDialogController from "./period-dialog-controller";

const dayOptions: SelectOption[] = [1, 2, 3, 4, 5, 6, 0].map((day) => ({
  id: String(day),
  name: DAY_NAMES[day].slice(0, 3),
}));

interface PeriodDialogProps {
  organizationId: string;
  academicYearId: string;
  classId: string;
  sectionId: string;
  assignments: ITeacherAssignment[];
  subjects: ISubject[];
  open: boolean;
  onClose: () => void;
}

const PeriodDialog = (props: PeriodDialogProps) => {
  const c = usePeriodDialogController(props);

  return (
    <FormDialog
      form={c.form}
      open={props.open}
      onClose={props.onClose}
      title="Add period"
      description="Pick every day this period repeats on."
      submitLabel="Add"
      isSubmitting={c.isSaving}
      onSubmit={c.submit}
      className="max-w-lg"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectField
          form={c.form}
          name="teacherUserId"
          label="Teacher"
          options={c.teacherOptions}
          onValueChange={c.pickTeacher}
        />
        <SelectField form={c.form} name="subjectId" label="Subject" options={c.subjectOptions} />
      </div>
      <ChipsField form={c.form} name="days" label="Days" options={dayOptions} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <TextField form={c.form} name="startTime" label="Starts" type="time" />
        <TextField form={c.form} name="endTime" label="Ends" type="time" />
        <TextField form={c.form} name="room" label="Room" placeholder="Optional" />
      </div>
      {c.teacherOptions.length === 0 && (
        <p className="text-sm text-amber-700">
          No teacher is assigned to this section yet. Assign one on the Classes page first.
        </p>
      )}
    </FormDialog>
  );
};

export default PeriodDialog;
