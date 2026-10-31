import { z } from "zod";

export const ptmEventSchema = z
  .object({
    title: z.string().trim().min(1, "Enter a title."),
    date: z.string().min(1, "Pick a date."),
    mode: z.enum(["onsite", "online"]),
    venue: z.string().trim(),
    defaultMeetingLink: z.string().trim(),
    slotDurationMins: z
      .string()
      .refine(
        (value) => Number.isInteger(Number(value)) && Number(value) >= 5 && Number(value) <= 120,
        "Between 5 and 120 minutes."
      ),
    sectionIds: z.array(z.string()).min(1, "Pick at least one section."),
  })
  .refine((value) => value.mode !== "online" || /^https?:\/\/\S+$/.test(value.defaultMeetingLink), {
    path: ["defaultMeetingLink"],
    message: "Enter the meeting link (starting with https://).",
  });
export type PTMEventFormValues = z.infer<typeof ptmEventSchema>;
export const defaultPTMEventValues: PTMEventFormValues = {
  title: "",
  date: "",
  mode: "onsite",
  venue: "",
  defaultMeetingLink: "",
  slotDurationMins: "10",
  sectionIds: [],
};

// a teacher's availability window; times are local "YYYY-MM-DDTHH:mm" from the picker
export const slotWindowSchema = z
  .object({
    teacherUserId: z.string().min(1, "Pick a teacher."),
    sectionId: z.string().min(1, "Pick a section."),
    startAt: z.string().min(1, "Pick a start time."),
    endAt: z.string().min(1, "Pick an end time."),
  })
  .refine((value) => !value.startAt || !value.endAt || new Date(value.endAt) > new Date(value.startAt), {
    path: ["endAt"],
    message: "End must be after the start.",
  });
export type SlotWindowFormValues = z.infer<typeof slotWindowSchema>;
export const defaultSlotWindowValues: SlotWindowFormValues = {
  teacherUserId: "",
  sectionId: "",
  startAt: "",
  endAt: "",
};
