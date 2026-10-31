import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { useError } from "@/shared/lib/hooks";
import { defaultPTMEventValues, ptmEventSchema, PTMEventFormValues } from "../ptm.schema";
import { useCreatePTMEvent } from "@/entities/ptm";

interface CreateEventDialogControllerProps {
  organizationId: string;
  academicYearId?: string;
  open: boolean;
  onClose: () => void;
}

const useCreateEventDialogController = ({
  organizationId,
  academicYearId,
  open,
  onClose,
}: CreateEventDialogControllerProps) => {
  const createEvent = useCreatePTMEvent(organizationId);
  useError({ mutation: createEvent });

  const form = useForm<PTMEventFormValues>({
    resolver: zodResolver(ptmEventSchema),
    defaultValues: defaultPTMEventValues,
  });
  const mode = useWatch({ control: form.control, name: "mode" });

  useEffect(() => {
    if (open) form.reset(defaultPTMEventValues);
  }, [open, form]);

  const onSubmit = form.handleSubmit((values) => {
    if (!academicYearId) {
      toast.error("Set a current academic year first (Academics page).");
      return;
    }
    createEvent.mutate(
      {
        academicYearId,
        title: values.title,
        date: values.date,
        mode: values.mode,
        venue: values.mode === "onsite" ? values.venue || undefined : undefined,
        defaultMeetingLink: values.mode === "online" ? values.defaultMeetingLink : undefined,
        slotDurationMins: Number(values.slotDurationMins),
        sectionIds: values.sectionIds,
      },
      {
        onSuccess: () => {
          toast.success("PTM event created.");
          onClose();
        },
      }
    );
  });

  return { form, mode, onSubmit, isSubmitting: createEvent.isPending };
};

export default useCreateEventDialogController;
