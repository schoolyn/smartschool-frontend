import DataTable from "@/shared/ui/data-table";
import EmptyState from "@/shared/ui/empty-state";
import ErrorState from "@/shared/ui/error-state";
import { SelectField, DateTimeField } from "@/shared/ui/form-fields";
import SectionHeader from "@/shared/ui/section-header";
import { Button } from "@/shared/ui/kit/button";
import { Card, CardTitle } from "@/shared/ui/kit/card";
import { Form } from "@/shared/ui/kit/form";
import { agendaColumns } from "./ptm-columns";
import useTeacherPTMController from "./ptm-controller";

const TeacherPTM = () => {
  const {
    form,
    agenda,
    eventOptions,
    sectionOptions,
    onEventChange,
    isLoadingAgenda,
    agendaError,
    retryAgenda,
    isGeneratingSlots,
    handleGenerateSlots,
  } = useTeacherPTMController();

  return (
    <div className="max-w-7xl mx-auto">
      <SectionHeader
        title="Parent-Teacher Meetings"
        description="Open your availability for parents to book, and track your agenda"
      />

      <Card className="mb-6">
        <CardTitle className="mb-4 font-medium">Open my availability</CardTitle>
        {eventOptions.length === 0 ? (
          <EmptyState
            compact
            title="No meetings scheduled yet"
            description="When the school schedules a parent-teacher meeting for your classes, you can open your time here."
          />
        ) : (
          <Form {...form}>
            <form onSubmit={handleGenerateSlots} noValidate>
              <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-4">
                <SelectField
                  form={form}
                  name="eventId"
                  label="PTM event"
                  options={eventOptions}
                  onValueChange={onEventChange}
                />
                <SelectField form={form} name="sectionId" label="Section" options={sectionOptions} />
                <DateTimeField form={form} name="startAt" label="From" />
                <DateTimeField form={form} name="endAt" label="To" />
              </div>
              <Button type="submit" className="mt-4" loading={isGeneratingSlots}>
                Generate slots
              </Button>
            </form>
          </Form>
        )}
      </Card>

      <div>
        <h3 className="mb-3 text-lg font-medium text-gray-900">My agenda</h3>
        {agendaError ? (
          <ErrorState error={agendaError} onRetry={retryAgenda} />
        ) : (
          <DataTable
            columns={agendaColumns}
            data={agenda}
            getRowId={(item) => item.slot.id}
            isLoading={isLoadingAgenda}
            empty={{ title: "No meetings booked yet", description: "When parents book your slots, they show up here." }}
          />
        )}
      </div>
    </div>
  );
};

export default TeacherPTM;
