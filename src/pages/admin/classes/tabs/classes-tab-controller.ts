import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { RowMenuItem } from "@/shared/ui/row-menu";
import { useMutationFeedback } from "@/shared/lib/hooks";
import { IClass } from "@/entities/academics";
import { useCreateClass, useDeactivateClass, useGetClasses, useUpdateClass } from "@/entities/academics";
import { classFormSchema, ClassFormValues, defaultClassFormValues } from "../classes.schema";

const useClassesTabController = (organizationId: string, yearId: string, onViewSections: (classId: string) => void) => {
  const [showInactive, setShowInactive] = useState(false);
  const classes = useGetClasses(organizationId, yearId, showInactive ? undefined : "active");
  const createClass = useCreateClass(organizationId);
  const updateClass = useUpdateClass(organizationId);
  const deactivateClass = useDeactivateClass(organizationId);

  const [dialog, setDialog] = useState<{ klass?: IClass } | null>(null);
  const [toDeactivate, setToDeactivate] = useState<IClass | null>(null);

  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classFormSchema),
    defaultValues: defaultClassFormValues,
  });

  useEffect(() => {
    if (!dialog) return;
    form.reset(
      dialog.klass
        ? { name: dialog.klass.name, numericLevel: dialog.klass.numericLevel?.toString() ?? "" }
        : defaultClassFormValues
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialog]);

  useMutationFeedback(createClass, "Class created", () => setDialog(null));
  useMutationFeedback(updateClass, "Class updated", () => setDialog(null));
  useMutationFeedback(deactivateClass, "Class deactivated", () => setToDeactivate(null));

  const submit = form.handleSubmit((values) => {
    const numericLevel = values.numericLevel ? Number(values.numericLevel) : null;
    if (dialog?.klass) {
      updateClass.mutate({ id: dialog.klass.id, name: values.name, numericLevel });
    } else {
      createClass.mutate({ name: values.name, numericLevel: numericLevel ?? undefined, academicYearId: yearId });
    }
  });

  const menuFor = (klass: IClass): RowMenuItem[] => [
    { label: "Edit", onSelect: () => setDialog({ klass }) },
    { label: "View sections", onSelect: () => onViewSections(klass.id) },
    klass.status === "active"
      ? { label: "Deactivate", onSelect: () => setToDeactivate(klass), danger: true }
      : { label: "Reactivate", onSelect: () => updateClass.mutate({ id: klass.id, status: "active" }) },
  ];

  return {
    items: classes.data?.items ?? [],
    isLoading: classes.isLoading,
    showInactive,
    setShowInactive,
    form,
    dialog,
    openAdd: () => setDialog({}),
    closeDialog: () => setDialog(null),
    submit,
    isSubmitting: createClass.isPending || updateClass.isPending,
    toDeactivate,
    closeDeactivate: () => setToDeactivate(null),
    confirmDeactivate: () => toDeactivate && deactivateClass.mutate(toDeactivate.id),
    isDeactivating: deactivateClass.isPending,
    menuFor,
  };
};

export default useClassesTabController;
