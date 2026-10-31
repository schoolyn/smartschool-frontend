import { z } from "zod";

import { localDateString } from "@/shared/lib";

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

export const homeworkFormSchema = z
  .object({
    subjectId: z.string().trim().min(1, "Select a subject."),
    title: z.string().trim().min(1, "Title is required."),
    description: z.string().trim().min(1, "Description is required."),
    assignedDate: z.string().trim().min(1, "Assigned date is required."),
    dueDate: z.string().trim().min(1, "Due date is required."),
    attachment: z
      .instanceof(File)
      .nullable()
      .refine((file) => !file || file.type === "application/pdf", "The attachment must be a PDF.")
      .refine((file) => !file || file.size <= MAX_ATTACHMENT_BYTES, "The attachment must be 10 MB or smaller."),
  })
  .refine((values) => !values.dueDate || !values.assignedDate || values.dueDate >= values.assignedDate, {
    message: "The due date cannot be before the assigned date.",
    path: ["dueDate"],
  });

export type HomeworkFormValues = z.infer<typeof homeworkFormSchema>;

// a function, so "today" is today when the form opens, not when the app loaded
export const defaultHomeworkFormValues = (): HomeworkFormValues => ({
  subjectId: "",
  title: "",
  description: "",
  assignedDate: localDateString(),
  dueDate: "",
  attachment: null,
});
