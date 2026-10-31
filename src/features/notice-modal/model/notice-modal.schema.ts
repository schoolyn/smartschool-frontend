import { z } from "zod";

const audienceSchema = z.object({
  scope: z.enum(["SCHOOL", "ROLE", "CLASS", "SECTION"]),
  roles: z.array(z.string()),
  classIds: z.array(z.string()),
  sectionIds: z.array(z.string()),
});

export const noticeFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  content: z.string().trim().min(1, "Content is required."),
  type: z.string().trim().min(1, "Select a notice type."),
  date: z.string().optional(),
  attachment: z.instanceof(File).nullable().optional(),
  audience: audienceSchema.optional(),
});

export type NoticeFormValues = z.infer<typeof noticeFormSchema>;

export const defaultNoticeAudience = { scope: "SCHOOL" as const, roles: [], classIds: [], sectionIds: [] };

export const defaultNoticeFormValues: NoticeFormValues = {
  title: "",
  content: "",
  date: "",
  type: "announcement",
  attachment: null,
  audience: defaultNoticeAudience,
};
