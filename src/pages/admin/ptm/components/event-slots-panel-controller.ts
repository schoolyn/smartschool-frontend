import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { useError } from "@/shared/lib/hooks";
import { IPTMEvent } from "@/entities/ptm";
import { ITeacherAssignment } from "@/entities/academics";
import { SelectOption } from "@/shared/types";
import { defaultSlotWindowValues, slotWindowSchema, SlotWindowFormValues } from "../ptm.schema";
import { useGenerateSlots, useGetSlotsForEvent } from "@/entities/ptm";

interface EventSlotsPanelControllerProps {
  organizationId: string;
  event: IPTMEvent;
  assignments: ITeacherAssignment[];
}

const useEventSlotsPanelController = ({ organizationId, event, assignments }: EventSlotsPanelControllerProps) => {
  const slots = useGetSlotsForEvent(organizationId, event.id);
  const generateSlots = useGenerateSlots(organizationId);
  useError({ mutation: generateSlots });

  const form = useForm<SlotWindowFormValues>({
    resolver: zodResolver(slotWindowSchema),
    defaultValues: defaultSlotWindowValues,
  });
  const teacherUserId = useWatch({ control: form.control, name: "teacherUserId" });

  const eventAssignments = assignments.filter((a) => a.sectionId && event.sectionIds.includes(a.sectionId.id));
  const teacherOptions: SelectOption[] = [
    ...new Map(
      eventAssignments.map((a) => [a.teacherUserId.id, { id: a.teacherUserId.id, name: a.teacherUserId.name }])
    ).values(),
  ];
  // only the event's sections this teacher teaches
  const sectionOptions: SelectOption[] = [
    ...new Map(
      eventAssignments
        .filter((a) => a.teacherUserId.id === teacherUserId)
        .map((a) => [a.sectionId.id, { id: a.sectionId.id, name: `${a.classId?.name ?? ""} - ${a.sectionId.name}` }])
    ).values(),
  ];

  const onTeacherChange = (id: string) => {
    const sections = eventAssignments.filter((a) => a.teacherUserId.id === id);
    const unique = new Set(sections.map((a) => a.sectionId.id));
    form.setValue("sectionId", unique.size === 1 ? [...unique][0] : "");
  };

  const onSubmit = form.handleSubmit((values) =>
    generateSlots.mutate(
      { ptmEventId: event.id, ...values },
      {
        onSuccess: () => {
          toast.success("Slots generated.");
          form.reset(defaultSlotWindowValues);
        },
      }
    )
  );

  return {
    form,
    teacherUserId,
    teacherOptions,
    sectionOptions,
    onTeacherChange,
    onSubmit,
    isGenerating: generateSlots.isPending,
    slots: slots.data?.items ?? [],
    isLoadingSlots: slots.isLoading,
  };
};

export default useEventSlotsPanelController;
