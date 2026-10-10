import { z } from "zod";

// a number typed into a text box: empty is allowed, anything else must be a whole number above zero
const optionalPositiveInteger = (label: string) =>
  z
    .string()
    .trim()
    .refine(
      (value) => value === "" || (/^\d+$/.test(value) && Number(value) > 0),
      `${label} must be a whole number above 0.`,
    );

export const yearFormSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required."),
    startDate: z.string().trim().min(1, "Start date is required."),
    endDate: z.string().trim().min(1, "End date is required."),
    isCurrent: z.boolean(),
  })
  .refine((data) => !data.startDate || !data.endDate || data.endDate > data.startDate, {
    message: "The end date must be after the start date.",
    path: ["endDate"],
  });
export type YearFormValues = z.infer<typeof yearFormSchema>;
export const defaultYearFormValues: YearFormValues = { name: "", startDate: "", endDate: "", isCurrent: false };

export const classFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  numericLevel: optionalPositiveInteger("Level"),
});
export type ClassFormValues = z.infer<typeof classFormSchema>;
export const defaultClassFormValues: ClassFormValues = { name: "", numericLevel: "" };

export const sectionFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  capacity: optionalPositiveInteger("Capacity"),
  roomNumber: z.string().trim(),
  classTeacherId: z.string(),
});
export type SectionFormValues = z.infer<typeof sectionFormSchema>;
export const defaultSectionFormValues: SectionFormValues = {
  name: "",
  capacity: "",
  roomNumber: "",
  classTeacherId: "",
};

export const SUBJECT_TYPES = ["core", "elective", "co_curricular"] as const;

export const subjectFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  code: z.string().trim().min(1, "Code is required."),
  type: z.enum(SUBJECT_TYPES),
});
export type SubjectFormValues = z.infer<typeof subjectFormSchema>;
export const defaultSubjectFormValues: SubjectFormValues = { name: "", code: "", type: "core" };

export const assignFormSchema = z
  .object({
    teacherId: z.string().trim().min(1, "Select a teacher."),
    classId: z.string().trim().min(1, "Select a class."),
    sectionId: z.string().trim().min(1, "Select a section."),
    subjectId: z.string().trim().optional(),
    role: z.enum(["SUBJECT_TEACHER", "CLASS_TEACHER"]),
  })
  .refine((data) => data.role !== "SUBJECT_TEACHER" || !!data.subjectId, {
    message: "Select a subject.",
    path: ["subjectId"],
  });
export type AssignFormValues = z.infer<typeof assignFormSchema>;
export const defaultAssignFormValues: AssignFormValues = {
  teacherId: "",
  classId: "",
  sectionId: "",
  subjectId: "",
  role: "SUBJECT_TEACHER",
};
