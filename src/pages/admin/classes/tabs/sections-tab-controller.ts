import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { RowMenuItem } from "@/shared/ui/row-menu";
import { useMutationFeedback } from "@/shared/lib/hooks";
import { ISection } from "@/entities/academics";
import {
  useCreateSection,
  useDeactivateSection,
  useGetClasses,
  useGetSections,
  useUpdateSection,
} from "@/entities/academics";
import { useGetAllTeachers } from "@/entities/academics";
import { defaultSectionFormValues, sectionFormSchema, SectionFormValues } from "../classes.schema";

const NO_TEACHER = "none";

const useSectionsTabController = (organizationId: string, yearId: string, classId: string) => {
  const [showInactive, setShowInactive] = useState(false);

  // all classes load so an inactive one opened from the classes tab still shows its sections
  const classes = useGetClasses(organizationId, yearId);
  const allClasses = classes.data?.items ?? [];
  const classOptions = allClasses.filter((klass) => klass.status === "active" || klass.id === classId);
  const selectedClass = classOptions.find((klass) => klass.id === classId);
  const classInactive = selectedClass?.status === "inactive";

  // an inactive class only has inactive sections, so they show without the toggle
  const sections = useGetSections(organizationId, classId, showInactive || classInactive ? undefined : "active");
  const teachers = useGetAllTeachers(organizationId);
  const createSection = useCreateSection(organizationId);
  const updateSection = useUpdateSection(organizationId);
  const deactivateSection = useDeactivateSection(organizationId);

  const [dialog, setDialog] = useState<{ section?: ISection } | null>(null);
  const [toDeactivate, setToDeactivate] = useState<ISection | null>(null);

  const form = useForm<SectionFormValues>({
    resolver: zodResolver(sectionFormSchema),
    defaultValues: defaultSectionFormValues,
  });

  const teacherOptions = useMemo(
    () => [
      { id: NO_TEACHER, name: "No class teacher" },
      ...(teachers.data?.items ?? []).map((teacher) => ({
        id: teacher.userId,
        name: `${teacher.name} (${teacher.email})`,
      })),
    ],
    [teachers.data]
  );

  useEffect(() => {
    if (!dialog) return;
    const section = dialog.section;
    form.reset(
      section
        ? {
            name: section.name,
            capacity: section.capacity?.toString() ?? "",
            roomNumber: section.roomNumber ?? "",
            classTeacherId: section.classTeacherId?.id ?? NO_TEACHER,
          }
        : { ...defaultSectionFormValues, classTeacherId: NO_TEACHER }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialog]);

  useMutationFeedback(createSection, "Section created", () => setDialog(null));
  useMutationFeedback(updateSection, "Section updated", () => setDialog(null));
  useMutationFeedback(deactivateSection, "Section deactivated", () => setToDeactivate(null));

  const submit = form.handleSubmit((values) => {
    const capacity = values.capacity ? Number(values.capacity) : null;
    const classTeacherId = values.classTeacherId === NO_TEACHER ? null : values.classTeacherId;

    if (dialog?.section) {
      // empty fields are sent as cleared so removing a capacity, room or teacher actually saves
      updateSection.mutate({
        id: dialog.section.id,
        name: values.name,
        capacity,
        roomNumber: values.roomNumber,
        classTeacherId,
      });
    } else {
      createSection.mutate({
        name: values.name,
        capacity: capacity ?? undefined,
        roomNumber: values.roomNumber || undefined,
        classTeacherId: classTeacherId ?? undefined,
        classId,
        academicYearId: yearId,
      });
    }
  });

  const menuFor = (section: ISection): RowMenuItem[] => [
    { label: "Edit", onSelect: () => setDialog({ section }) },
    section.status === "active"
      ? { label: "Deactivate", onSelect: () => setToDeactivate(section), danger: true }
      : { label: "Reactivate", onSelect: () => updateSection.mutate({ id: section.id, status: "active" }) },
  ];

  return {
    classOptions,
    selectedClass,
    classInactive,
    items: sections.data?.items ?? [],
    isLoading: sections.isLoading,
    showInactive,
    setShowInactive,
    teacherOptions,
    form,
    dialog,
    openAdd: () => setDialog({}),
    closeDialog: () => setDialog(null),
    submit,
    isSubmitting: createSection.isPending || updateSection.isPending,
    toDeactivate,
    closeDeactivate: () => setToDeactivate(null),
    confirmDeactivate: () => toDeactivate && deactivateSection.mutate(toDeactivate.id),
    isDeactivating: deactivateSection.isPending,
    menuFor,
  };
};

export default useSectionsTabController;
