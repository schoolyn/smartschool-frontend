import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { RowMenuItem } from "@/shared/ui/row-menu";
import { useMutationFeedback } from "@/shared/lib/hooks";
import { ISubject } from "@/entities/academics";
import { useCreateSubject, useDeactivateSubject, useGetSubjects, useUpdateSubject } from "@/entities/academics";
import { defaultSubjectFormValues, subjectFormSchema, SubjectFormValues } from "../classes.schema";

const useSubjectsTabController = (organizationId: string, yearId: string) => {
  const [showInactive, setShowInactive] = useState(false);
  const subjects = useGetSubjects(organizationId, yearId, showInactive ? undefined : "active");
  const createSubject = useCreateSubject(organizationId);
  const updateSubject = useUpdateSubject(organizationId);
  const deactivateSubject = useDeactivateSubject(organizationId);

  const [dialog, setDialog] = useState<{ subject?: ISubject } | null>(null);
  const [toDeactivate, setToDeactivate] = useState<ISubject | null>(null);

  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: defaultSubjectFormValues,
  });

  useEffect(() => {
    if (!dialog) return;
    const subject = dialog.subject;
    form.reset(
      subject
        ? { name: subject.name, code: subject.code, type: (subject.type as SubjectFormValues["type"]) ?? "core" }
        : defaultSubjectFormValues
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialog]);

  useMutationFeedback(createSubject, "Subject created", () => setDialog(null));
  useMutationFeedback(updateSubject, "Subject updated", () => setDialog(null));
  useMutationFeedback(deactivateSubject, "Subject deactivated", () => setToDeactivate(null));

  const submit = form.handleSubmit((values) => {
    if (dialog?.subject) {
      updateSubject.mutate({ id: dialog.subject.id, ...values });
    } else {
      createSubject.mutate({ ...values, academicYearId: yearId });
    }
  });

  const menuFor = (subject: ISubject): RowMenuItem[] => [
    { label: "Edit", onSelect: () => setDialog({ subject }) },
    subject.status === "active"
      ? { label: "Deactivate", onSelect: () => setToDeactivate(subject), danger: true }
      : { label: "Reactivate", onSelect: () => updateSubject.mutate({ id: subject.id, status: "active" }) },
  ];

  return {
    items: subjects.data?.items ?? [],
    isLoading: subjects.isLoading,
    showInactive,
    setShowInactive,
    form,
    dialog,
    openAdd: () => setDialog({}),
    closeDialog: () => setDialog(null),
    submit,
    isSubmitting: createSubject.isPending || updateSubject.isPending,
    toDeactivate,
    closeDeactivate: () => setToDeactivate(null),
    confirmDeactivate: () => toDeactivate && deactivateSubject.mutate(toDeactivate.id),
    isDeactivating: deactivateSubject.isPending,
    menuFor,
  };
};

export default useSubjectsTabController;
