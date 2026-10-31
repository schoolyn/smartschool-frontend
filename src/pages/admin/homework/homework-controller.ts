import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { useGetSubjects } from "@/entities/academics";
import { useSectionPicker } from "@/features/section-picker";
import { useGetHomeworkList, useCreateHomework, useDeleteHomework } from "@/entities/homework";
import { homeworkFormSchema, defaultHomeworkFormValues } from "./homework.schema";

// shared by admins and teachers: the pickers offer a teacher only the sections they teach
export const useHomeworkController = () => {
  const { organizationId = "" } = useParams();
  const picker = useSectionPicker(organizationId);
  const { academicYearId, classId, sectionId } = picker;

  const [showForm, setShowForm] = useState(false);
  const form = useForm({ resolver: zodResolver(homeworkFormSchema), defaultValues: defaultHomeworkFormValues() });

  const subjects = useGetSubjects(organizationId, academicYearId, "active");
  const homeworkList = useGetHomeworkList(organizationId, sectionId);
  const createHomework = useCreateHomework(organizationId, sectionId);
  const deleteHomework = useDeleteHomework(organizationId, sectionId);

  const onSubmit = form.handleSubmit((values) => {
    if (!academicYearId || !classId || !sectionId) {
      toast.error("Please select academic year, class and section");
      return;
    }

    const formData = new FormData();
    formData.append("academicYearId", academicYearId);
    formData.append("classId", classId);
    formData.append("sectionId", sectionId);
    formData.append("subjectId", values.subjectId);
    formData.append("title", values.title);
    formData.append("description", values.description);
    formData.append("assignedDate", values.assignedDate);
    formData.append("dueDate", values.dueDate);
    if (values.attachment) formData.append("attachment", values.attachment);

    createHomework.mutate(formData);
  });

  useEffect(() => {
    if (createHomework.isSuccess) {
      toast.success("Homework created.");
      setShowForm(false);
      form.reset(defaultHomeworkFormValues());
    }
    if (createHomework.isError) {
      toast.error(createHomework.error?.response?.Error?.message || "Failed to create homework");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createHomework.isSuccess, createHomework.isError]);

  const [homeworkIdPendingDelete, setHomeworkIdPendingDelete] = useState<string | null>(null);

  const confirmDelete = () => {
    if (!homeworkIdPendingDelete) return;
    deleteHomework.mutate(homeworkIdPendingDelete, {
      onSuccess: () => {
        toast.success("Homework deleted.");
        setHomeworkIdPendingDelete(null);
      },
      onError: (error) => toast.error(error?.response?.Error?.message || "The homework could not be deleted."),
    });
  };

  return {
    academicYears: picker.academicYears,
    classes: picker.classes,
    sections: picker.sections,
    hasNoClasses: picker.hasNoClasses,
    subjects: subjects.data?.items || [],
    homeworkList: homeworkList.data?.rows || [],
    isLoadingHomework: homeworkList.isLoading,
    academicYearId,
    setAcademicYearId: picker.setAcademicYearId,
    classId,
    setClassId: picker.setClassId,
    sectionId,
    setSectionId: picker.setSectionId,
    showForm,
    setShowForm,
    toggleForm: () => setShowForm((open) => !open),
    form,
    onSubmit,
    handleDelete: setHomeworkIdPendingDelete,
    homeworkIdPendingDelete,
    cancelDelete: () => setHomeworkIdPendingDelete(null),
    confirmDelete,
    isDeleting: deleteHomework.isPending,
    isCreating: createHomework.isPending,
  };
};
