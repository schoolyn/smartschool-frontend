import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import useBulkImportStudents, { IBulkImportResult } from "@/pages/admin/students/service/bulk-import-students";
import { useGetAcademicYears, useGetClasses, useGetSections } from "@/pages/admin/classes/service/academics-service";
import { bulkUploadFormSchema, defaultBulkUploadFormValues } from "./bulk-upload-modal.schema";

const useBulkUploadModalController = (organizationId: string, onImported: () => void) => {
  const [result, setResult] = useState<IBulkImportResult | null>(null);

  const form = useForm({ resolver: zodResolver(bulkUploadFormSchema), defaultValues: defaultBulkUploadFormValues });
  const academicYearId = form.watch("academicYearId");
  const classId = form.watch("classId");

  const academicYears = useGetAcademicYears(organizationId);
  const classes = useGetClasses(organizationId, academicYearId, "active");
  const sections = useGetSections(organizationId, classId, "active");
  const bulkImport = useBulkImportStudents(organizationId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue("file", e.target.files?.[0] || null);
  };

  const onAcademicYearChange = (id: string) => {
    form.setValue("academicYearId", id);
    form.setValue("classId", "");
    form.setValue("sectionId", "");
  };

  const onClassChange = (id: string) => {
    form.setValue("classId", id);
    form.setValue("sectionId", "");
  };

  const reset = () => {
    form.reset(defaultBulkUploadFormValues);
    setResult(null);
  };

  const handleSubmit = form.handleSubmit((values) => {
    if (!values.file) return;
    bulkImport.mutate(
      {
        academicYearId: values.academicYearId,
        classId: values.classId,
        sectionId: values.sectionId,
        file: values.file,
      },
      {
        onSuccess: (data) => {
          setResult(data);
          if (data.createdCount > 0) onImported();
        },
        onError: () => {
          toast.error("Failed to import students");
        },
      }
    );
  });

  return {
    form,
    academicYearId,
    setAcademicYearId: onAcademicYearChange,
    classId,
    setClassId: onClassChange,
    sectionId: form.watch("sectionId"),
    setSectionId: (id: string) => form.setValue("sectionId", id),
    file: form.watch("file"),
    handleFileChange,
    academicYears: academicYears.data?.items || [],
    classes: classes.data?.items || [],
    sections: sections.data?.items || [],
    result,
    reset,
    handleSubmit,
    isSubmitting: bulkImport.isPending,
  };
};

export default useBulkUploadModalController;
