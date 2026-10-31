import { SelectField, DateTimeField } from "@/shared/ui/form-fields";
import Spinner from "@/shared/ui/spinner";
import { Button } from "@/shared/ui/kit/button";
import { Form } from "@/shared/ui/kit/form";
import { IPTMEvent } from "@/entities/ptm";
import { ITeacherAssignment } from "@/entities/academics";
import useEventSlotsPanelController from "./event-slots-panel-controller";

interface EventSlotsPanelProps {
  organizationId: string;
  event: IPTMEvent;
  assignments: ITeacherAssignment[];
}

// open a teacher's slots for one event, and see the slots it already has
const EventSlotsPanel = ({ organizationId, event, assignments }: EventSlotsPanelProps) => {
  const {
    form,
    teacherUserId,
    teacherOptions,
    sectionOptions,
    onTeacherChange,
    onSubmit,
    isGenerating,
    slots,
    isLoadingSlots,
  } = useEventSlotsPanelController({ organizationId, event, assignments });

  return (
    <div className="mt-4 rounded-md bg-gray-50 p-4">
      <p className="mb-2 text-sm font-medium text-gray-700">Generate slots for a teacher</p>
      {teacherOptions.length === 0 ? (
        <p className="text-sm text-gray-500">
          No teacher is assigned to this event's sections yet (Academics, Assignments).
        </p>
      ) : (
        <Form {...form}>
          <form onSubmit={onSubmit} noValidate>
            <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-4">
              <SelectField
                form={form}
                name="teacherUserId"
                label="Teacher"
                options={teacherOptions}
                onValueChange={onTeacherChange}
              />
              <SelectField
                form={form}
                name="sectionId"
                label="Section"
                options={sectionOptions}
                disabled={!teacherUserId}
              />
              <DateTimeField form={form} name="startAt" label="From" />
              <DateTimeField form={form} name="endAt" label="To" />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              The window is split into {event.slotDurationMins}-minute slots.
            </p>
            <Button type="submit" className="mt-3" loading={isGenerating}>
              Generate slots
            </Button>
          </form>
        </Form>
      )}

      <div className="mt-4">
        <p className="mb-2 text-sm font-medium text-gray-700">Existing slots ({slots.length})</p>
        {isLoadingSlots ? (
          <Spinner />
        ) : (
          <div className="flex flex-wrap gap-2">
            {slots.map((slot) => (
              <span
                key={slot.id}
                className={`rounded border px-2 py-1 text-xs ${
                  slot.bookedCount >= slot.capacity
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-green-200 bg-green-50 text-green-700"
                }`}
              >
                {new Date(slot.startAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} (
                {slot.bookedCount}/{slot.capacity})
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventSlotsPanel;
