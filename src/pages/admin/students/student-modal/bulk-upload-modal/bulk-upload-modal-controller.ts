import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { useBulkImportStudents, IBulkImportResult } from "@/entities/student";
import { useGetAcademicYears, useGetClasses, useGetSections } from "@/entities/academics";
import { SelectOption } from "@/shared/types";
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

  // a new year or class invalidates the choices below it
  const onAcademicYearChange = () => {
    form.setValue("classId", "");
    form.setValue("sectionId", "");
  };
  const onClassChange = () => form.setValue("sectionId", "");

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
        onError: (error) => toast.error(error?.response?.Error?.message || "Failed to import students"),
      }
    );
  });

  return {
    form,
    onAcademicYearChange,
    onClassChange,
    academicYearOptions: (academicYears.data?.items || []).map((y): SelectOption => ({ id: y.id, name: y.name })),
    classOptions: (classes.data?.items || []).map((k): SelectOption => ({ id: k.id, name: k.name })),
    sectionOptions: (sections.data?.items || []).map((s): SelectOption => ({ id: s.id, name: s.name })),
    academicYearId,
    classId,
    result,
    reset,
    handleSubmit,
    isSubmitting: bulkImport.isPending,
  };
};

export default useBulkUploadModalController;
