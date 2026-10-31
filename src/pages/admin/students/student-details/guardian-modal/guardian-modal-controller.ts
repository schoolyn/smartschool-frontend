import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { IAddGuardianValue } from "@/entities/student";
import { guardianFormSchema, defaultGuardianFormValues, GuardianFormValues } from "./guardian-modal.schema";

const useGuardianModalController = (isOpen: boolean, onSubmit: (value: IAddGuardianValue) => void) => {
  const form = useForm<GuardianFormValues>({
    resolver: zodResolver(guardianFormSchema),
    defaultValues: defaultGuardianFormValues,
  });

  // every opening starts empty, never with the guardian added (or abandoned) last time
  useEffect(() => {
    if (isOpen) form.reset(defaultGuardianFormValues);
  }, [isOpen, form]);

  return { form, submit: form.handleSubmit((values) => onSubmit(values)) };
};

export default useGuardianModalController;
