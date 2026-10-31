import { z } from "zod";

export const periodSchema = z
  .object({
    teacherUserId: z.string().min(1, "Pick a teacher."),
    subjectId: z.string().min(1, "Pick a subject."),
    days: z.array(z.string()).min(1, "Pick at least one day."),
    startTime: z.string().min(1, "Pick a start time."),
    endTime: z.string().min(1, "Pick an end time."),
    room: z.string().trim(),
  })
  .refine((value) => !value.startTime || !value.endTime || value.endTime > value.startTime, {
    path: ["endTime"],
    message: "End must be after the start.",
  });
export type PeriodFormValues = z.infer<typeof periodSchema>;
export const defaultPeriodValues: PeriodFormValues = {
  teacherUserId: "",
  subjectId: "",
  days: [],
  startTime: "",
  endTime: "",
  room: "",
};
