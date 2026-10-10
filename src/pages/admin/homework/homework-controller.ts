import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

import {
  useGetAcademicYears,
  useGetClasses,
  useGetSections,
  useGetSubjects,
} from "../classes/service/academics-service";
import { useGetHomeworkList, useCreateHomework, useDeleteHomework } from "./service/homework-service";
import { homeworkFormSchema, defaultHomeworkFormValues } from "./homework.schema";

export const useHomeworkController = () => {
  const { organizationId = "" } = useParams();

  const [academicYearId, setAcademicYearIdRaw] = useState("");
  const [classId, setClassIdRaw] = useState("");
  const [sectionId, setSectionId] = useState("");

  const [showForm, setShowForm] = useState(false);
  const form = useForm({ resolver: zodResolver(homeworkFormSchema), defaultValues: defaultHomeworkFormValues });

  const setAcademicYearId = (id: string) => {
    setAcademicYearIdRaw(id);
    setClassIdRaw("");
    setSectionId("");
  };

  const setClassId = (id: string) => {
    setClassIdRaw(id);
    setSectionId("");
  };

  const academicYears = useGetAcademicYears(organizationId);
  const classes = useGetClasses(organizationId, academicYearId, "active");
  const sections = useGetSections(organizationId, classId, "active");
  const subjects = useGetSubjects(organizationId, academicYearId, "active");
  const homeworkList = useGetHomeworkList(organizationId, sectionId);

  const createHomework = useCreateHomework(organizationId, sectionId);
  const deleteHomework = useDeleteHomework(organizationId, sectionId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue("attachment", e.target.files?.[0] || null);
  };

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
      form.reset(defaultHomeworkFormValues);
    }
    if (createHomework.isError) {
      toast.error(createHomework.error?.response?.Error?.message || "Failed to create homework");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createHomework.isSuccess, createHomework.isError]);

  const [homeworkIdPendingDelete, setHomeworkIdPendingDelete] = useState<string | null>(null);

  const handleDelete = (homeworkId: string) => {
    setHomeworkIdPendingDelete(homeworkId);
  };

  const cancelDelete = () => setHomeworkIdPendingDelete(null);

  const confirmDelete = () => {
    if (!homeworkIdPendingDelete) return;
    deleteHomework.mutate(homeworkIdPendingDelete, {
      onSuccess: () => setHomeworkIdPendingDelete(null),
    });
  };

  return {
    academicYears: academicYears.data?.items || [],
    classes: classes.data?.items || [],
    sections: sections.data?.items || [],
    subjects: subjects.data?.items || [],
    homeworkList: homeworkList.data?.items || [],
    isLoadingHomework: homeworkList.isLoading,
    academicYearId,
    setAcademicYearId,
    classId,
    setClassId,
    sectionId,
    setSectionId,
    showForm,
    setShowForm,
    form,
    handleFileChange,
    onSubmit,
    handleDelete,
    homeworkIdPendingDelete,
    cancelDelete,
    confirmDelete,
    isDeleting: deleteHomework.isPending,
    isCreating: createHomework.isPending,
  };
};
