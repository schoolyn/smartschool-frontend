import { z } from "zod";

const screenshot = z
  .custom<File | null>((value) => value === null || value instanceof File)
  .refine((file) => !file || ["image/png", "image/jpeg"].includes(file.type), "Attach a PNG or JPG screenshot.")
  .refine((file) => !file || file.size <= 10 * 1024 * 1024, "Keep the screenshot under 10 MB.");
const body = z.string().trim().min(1, "Write a message.").max(5000, "Keep the message under 5000 characters.");

export const newSupportRequestSchema = z.object({
  topic: z.enum(["fees", "attendance", "login", "bug", "other"]),
  subject: z.string().trim().min(3, "Add a short subject.").max(120),
  body,
  screenshot,
});
export type NewSupportRequestValues = z.infer<typeof newSupportRequestSchema>;
export const defaultNewSupportRequest: NewSupportRequestValues = {
  topic: "bug",
  subject: "",
  body: "",
  screenshot: null,
};

export const supportReplySchema = z.object({ body, screenshot });
export type SupportReplyValues = z.infer<typeof supportReplySchema>;
export const defaultSupportReply: SupportReplyValues = { body: "", screenshot: null };
