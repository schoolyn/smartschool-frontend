import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { useGetPTMEvents, useGenerateSlots, useGetMyPTMAgenda } from "@/entities/ptm";
import { useGetMyTeacherAssignments } from "@/entities/academics";
import { useAuth } from "@/entities/session";
import { useError } from "@/shared/lib/hooks";
import { SelectOption } from "@/shared/types";
import { defaultOpenAvailabilityValues, openAvailabilitySchema, OpenAvailabilityFormValues } from "./ptm.schema";

const useTeacherPTMController = () => {
  const { organizationId } = useParams();
  const { user } = useAuth();
  const org = organizationId || "";

  const getPTMEvents = useGetPTMEvents(org);
  const getMyAgenda = useGetMyPTMAgenda(org);
  const getMyAssignments = useGetMyTeacherAssignments(org);
  const generateSlots = useGenerateSlots(org);

  useError({ mutation: generateSlots });

  const form = useForm<OpenAvailabilityFormValues>({
    resolver: zodResolver(openAvailabilitySchema),
    defaultValues: defaultOpenAvailabilityValues,
  });
  const eventId = useWatch({ control: form.control, name: "eventId" });

  const events = getPTMEvents.data?.items || [];
  const agenda = getMyAgenda.data?.items || [];
  const selectedEvent = events.find((e) => e.id === eventId);
  // the event's sections this teacher teaches, each listed once and named with its class
  const sectionOptions: SelectOption[] = [
    ...new Map(
      (getMyAssignments.data?.items || [])
        .filter((a) => a.sectionId && selectedEvent?.sectionIds.includes(a.sectionId.id))
        .map((a) => [a.sectionId.id, { id: a.sectionId.id, name: `${a.classId?.name ?? ""} - ${a.sectionId.name}` }])
    ).values(),
  ];

  const eventOptions: SelectOption[] = events.map((event) => ({
    id: event.id,
    name: `${event.title} (${new Date(event.date).toLocaleDateString()})`,
  }));

  // a new event invalidates the section chosen for the previous one
  const onEventChange = () => form.setValue("sectionId", "");

  const handleGenerateSlots = form.handleSubmit((values) => {
    if (!user?.id) return;
    generateSlots.mutate(
      {
        ptmEventId: values.eventId,
        teacherUserId: user.id,
        sectionId: values.sectionId,
        startAt: values.startAt,
        endAt: values.endAt,
      },
      {
        onSuccess: () => {
          toast.success("Slots generated.");
          form.reset(defaultOpenAvailabilityValues);
        },
      }
    );
  });

  return {
    form,
    agenda,
    eventOptions,
    sectionOptions,
    onEventChange,
    isLoadingAgenda: getMyAgenda.isLoading,
    agendaError: getMyAgenda.isError ? getMyAgenda.error : null,
    retryAgenda: () => getMyAgenda.refetch(),
    isGeneratingSlots: generateSlots.isPending,
    handleGenerateSlots,
  };
};

export default useTeacherPTMController;
