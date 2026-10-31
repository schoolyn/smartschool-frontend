import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { useAreaBase, useCan } from "@/entities/session";
import { useDebouncedValue } from "@/shared/lib/hooks";
import { useGetAcademicYears, useGetClasses, useGetSections } from "@/entities/academics";
import { IAPIError, SelectOption } from "@/shared/types";
import { API_QUERY_KEY, EMAIL_REGEX_PATTERN, resizeImage } from "@/shared/lib";
import { useAddStudent, useGetStudentById, useUpdateStudentDetail } from "@/entities/student";
import { useGetParentByEmail } from "@/entities/student";
import {
  removeStudentPhoto,
  uploadStudentPhoto,
  useNextAdmissionNumber,
  useSetAdmissionPrefix,
} from "@/entities/student";
import {
  StudentFormValues,
  emptyStudentForm,
  studentFormSchema,
  toStudentFormValues,
  toStudentPayload,
} from "./student-form.schema";

const messageOf = (error: unknown) => (error as IAPIError)?.response?.Error?.message || "Something went wrong.";

// one form for a new admission (/admissions) and for editing a student (/students/edit/:studentId)
const useStudentFormController = () => {
  const { organizationId = "", studentId = "" } = useParams();
  const isEdit = !!studentId;
  const navigate = useNavigate();
  const areaBase = useAreaBase();
  const queryClient = useQueryClient();

  const student = useGetStudentById(organizationId, studentId);
  const saved = student.data?.item;
  const hasLogin = !isEdit || !!saved?.parentId;

  const schema = useMemo(() => studentFormSchema(isEdit, hasLogin), [isEdit, hasLogin]);
  const form = useForm<StudentFormValues>({ resolver: zodResolver(schema), defaultValues: emptyStudentForm() });
  // filled once per student, so a background refresh never wipes what is being typed
  const filledFor = useRef("");
  useEffect(() => {
    if (saved && filledFor.current !== saved.id) {
      filledFor.current = saved.id;
      form.reset(toStudentFormValues(saved));
    }
  }, [saved, form]);

  const [academicYearId, classId, admissionDate, loginContact, photo, removePhoto] = form.watch([
    "academicYearId",
    "classId",
    "admissionDate",
    "loginContact",
    "photo",
    "removePhoto",
  ]);

  const academicYears = useGetAcademicYears(organizationId);
  const classes = useGetClasses(organizationId, academicYearId, "active");
  const sections = useGetSections(organizationId, classId, "active");
  const currentYearId = academicYears.data?.items.find((year) => year.isCurrent)?.id;

  // a new admission starts in the current year
  useEffect(() => {
    if (!isEdit && currentYearId && !form.getValues("academicYearId")) form.setValue("academicYearId", currentYearId);
  }, [isEdit, currentYearId, form]);

  // a class and section from another year, or a section of another class, cannot stay picked
  const onYearChange = () => {
    form.setValue("classId", "");
    form.setValue("sectionId", "");
  };
  const onClassChange = () => form.setValue("sectionId", "");

  const options = (items: { id: string; name: string }[] = []): SelectOption[] =>
    items.map((item) => ({ id: item.id, name: item.name }));

  const nextNumber = useNextAdmissionNumber(organizationId, admissionDate || "", !isEdit);
  const setPrefix = useSetAdmissionPrefix(organizationId);
  const canSetPrefix = useCan()("school.settings");
  const [isPrefixOpen, setIsPrefixOpen] = useState(false);
  const savePrefix = (prefix: string) =>
    setPrefix.mutate(prefix, {
      onSuccess: () => setIsPrefixOpen(false),
      onError: (error) => toast.error(messageOf(error)),
    });

  // an email that already has a parent account in this school links this child to it
  const watchedLoginEmail = form.watch(
    loginContact === "guardian" ? "parentEmail" : loginContact === "mother" ? "mother.email" : "father.email"
  );
  const loginEmail = useDebouncedValue(watchedLoginEmail?.trim() ?? "", 400);
  const existingParent = useGetParentByEmail(
    organizationId,
    !isEdit && EMAIL_REGEX_PATTERN.test(loginEmail) ? loginEmail : ""
  ).data;

  // the photo shown: a newly picked file, nothing once removed, or the saved one
  const photoPreview = useMemo(() => (photo ? URL.createObjectURL(photo) : null), [photo]);
  useEffect(() => () => (photoPreview ? URL.revokeObjectURL(photoPreview) : undefined), [photoPreview]);
  const shownPhoto = photoPreview ?? (removePhoto ? null : (saved?.photoUrl ?? null));
  // shrunk in the browser first, so a phone camera picture uploads and loads quickly
  const pickPhoto = async (file: File) => {
    form.setValue("photo", await resizeImage(file).catch(() => file));
    form.setValue("removePhoto", false);
  };
  const clearPhoto = () => {
    form.setValue("photo", null);
    form.setValue("removePhoto", true);
  };

  const addStudent = useAddStudent(organizationId);
  const updateStudent = useUpdateStudentDetail(organizationId);
  const [isSaving, setIsSaving] = useState(false);

  const profilePath = (id: string) => `${areaBase}/students/detail/${id}`;

  // the student is saved first; a photo that then fails to upload is reported without losing the admission
  const onSubmit = form.handleSubmit(async (values) => {
    setIsSaving(true);
    let id = studentId;
    try {
      const payload = toStudentPayload(values, isEdit);
      if (isEdit) await updateStudent.mutateAsync(payload);
      else id = (await addStudent.mutateAsync(payload)).item.id;
    } catch (error) {
      toast.error(messageOf(error));
      setIsSaving(false);
      return;
    }

    try {
      if (values.photo) await uploadStudentPhoto(organizationId, id, values.photo);
      else if (values.removePhoto) await removeStudentPhoto(organizationId, id);
      toast.success(isEdit ? "Student details saved." : "Student admitted.");
    } catch (error) {
      toast.error(`${isEdit ? "Details saved" : "Student admitted"}, but the photo was not: ${messageOf(error)}`);
    }

    // the profile opens with the saved details, never the old ones for a moment
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_STUDENT_PROFILE, organizationId] }),
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_STUDENT_BY_ID, id] }),
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEY.GET_NEXT_ADMISSION_NUMBER, organizationId] }),
    ]);
    setIsSaving(false);
    navigate(profilePath(id));
  });

  const cancel = () => navigate(isEdit ? profilePath(studentId) : `${areaBase}/students`);

  return {
    form,
    isEdit,
    hasLogin,
    isLoading: isEdit && student.isLoading,
    notFound: isEdit && student.isError,
    studentName: saved?.name ?? "",
    yearOptions: options(academicYears.data?.items),
    classOptions: options(classes.data?.items),
    sectionOptions: options(sections.data?.items),
    hasClasses: !!classes.data?.items.length,
    onYearChange,
    onClassChange,
    loginContact,
    nextAdmissionNumber: nextNumber.data?.admissionNumber,
    admissionPrefix: nextNumber.data?.prefix ?? "",
    canSetPrefix,
    isPrefixOpen,
    setIsPrefixOpen,
    savePrefix,
    isSavingPrefix: setPrefix.isPending,
    existingParent: existingParent?.is_parent_exists ? existingParent.item : null,
    shownPhoto,
    pickPhoto,
    clearPhoto,
    sameAddress: form.watch("sameAddress"),
    isSaving,
    onSubmit,
    cancel,
    enrollment: saved?.currentEnrollment,
  };
};

export default useStudentFormController;
