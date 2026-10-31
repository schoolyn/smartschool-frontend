import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { useGetTeacherDirectory, useUpsertStaffProfile } from "@/entities/staff";
import { ITeacherDirectoryEntry } from "@/entities/staff";
import { staffProfileSchema, defaultStaffProfileValues } from "./teachers.schema";

const useTeachersController = () => {
  const { organizationId = "" } = useParams();

  const teachers = useGetTeacherDirectory(organizationId);
  const upsertStaffProfile = useUpsertStaffProfile(organizationId);

  const [editingTeacher, setEditingTeacher] = useState<ITeacherDirectoryEntry | null>(null);

  const form = useForm({ resolver: zodResolver(staffProfileSchema), defaultValues: defaultStaffProfileValues });

  const openEdit = (teacher: ITeacherDirectoryEntry) => {
    setEditingTeacher(teacher);
    form.reset({
      employeeCode: teacher.staffProfile?.employeeCode || "",
      designation: teacher.staffProfile?.designation || "",
      department: teacher.staffProfile?.department || "",
      qualification: teacher.staffProfile?.qualification || "",
      dateOfJoining: teacher.staffProfile?.dateOfJoining ? teacher.staffProfile.dateOfJoining.slice(0, 10) : "",
      dateOfBirth: teacher.staffProfile?.dateOfBirth ?? "",
    });
  };

  const closeEdit = () => setEditingTeacher(null);

  const submitProfile = form.handleSubmit((values) => {
    if (!editingTeacher) return;
    upsertStaffProfile.mutate(
      { userId: editingTeacher.userId, ...values },
      {
        onSuccess: () => {
          toast.success("Staff profile saved.");
          setEditingTeacher(null);
        },
        onError: (error) => toast.error(error?.response?.Error?.message || "Failed to save profile"),
      }
    );
  });

  return {
    teachers: teachers.data?.items || [],
    isLoading: teachers.isLoading,
    loadError: teachers.isError ? teachers.error : null,
    retryLoad: () => teachers.refetch(),
    editingTeacher,
    openEdit,
    closeEdit,
    form,
    submitProfile,
    isSaving: upsertStaffProfile.isPending,
  };
};

export default useTeachersController;
