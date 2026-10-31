import { z } from "zod";

import { ILetterhead } from "@/entities/organization";

const optional = (max: number) => z.string().trim().max(max, `Keep it under ${max} characters.`);

export const letterheadSchema = z.object({
  tagline: optional(120),
  phone: optional(40),
  email: z.union([z.literal(""), z.string().trim().email("Enter a valid email.")]),
  website: optional(120),
  board: optional(60),
  registrationNo: optional(60),
  affiliationNo: optional(60),
  udiseCode: optional(30),
  principalName: optional(80),
  principalTitle: optional(60),
});

export type LetterheadFormValues = z.infer<typeof letterheadSchema>;

export const letterheadDefaults = (letterhead?: Partial<ILetterhead>): LetterheadFormValues => ({
  tagline: letterhead?.tagline ?? "",
  phone: letterhead?.phone ?? "",
  email: letterhead?.email ?? "",
  website: letterhead?.website ?? "",
  board: letterhead?.board ?? "",
  registrationNo: letterhead?.registrationNo ?? "",
  affiliationNo: letterhead?.affiliationNo ?? "",
  udiseCode: letterhead?.udiseCode ?? "",
  principalName: letterhead?.principalName ?? "",
  principalTitle: letterhead?.principalTitle || "Principal",
});
