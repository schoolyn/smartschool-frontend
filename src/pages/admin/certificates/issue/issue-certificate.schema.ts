import { z } from "zod";

import { ICertificateDraft } from "@/entities/certificate";
import { SelectOption } from "@/shared/types";

const required = (label: string, max = 120) => z.string().trim().min(1, `${label} is required.`).max(max);
const gender = z.enum(["male", "female", "other"], { message: "Choose one." });

export const GENDER_OPTIONS: SelectOption[] = [
  { id: "male", name: "Son" },
  { id: "female", name: "Daughter" },
  { id: "other", name: "Ward" },
];

export const PURPOSE_OPTIONS: SelectOption[] = [
  { id: "opening a bank account", name: "Opening a bank account" },
  { id: "passport application", name: "Passport application" },
  { id: "scholarship application", name: "Scholarship application" },
  { id: "travel concession", name: "Travel concession" },
  { id: "other", name: "Other" },
];

export const CATEGORY_OPTIONS: SelectOption[] = ["General", "OBC", "SC", "ST", "EWS", "Other"].map((name) => ({
  id: name,
  name,
}));

export const bonafideSchema = z
  .object({
    gender,
    parentName: required("Parent's name"),
    purposeChoice: required("Purpose"),
    purposeOther: z.string().trim().max(160),
  })
  .refine((v) => v.purposeChoice !== "other" || v.purposeOther.length > 0, {
    path: ["purposeOther"],
    message: "Write the purpose.",
  });

export type BonafideFormValues = z.infer<typeof bonafideSchema>;

export const transferSchema = z.object({
  gender,
  fatherName: required("Father's or guardian's name"),
  motherName: z.string().trim().max(120),
  nationality: required("Nationality", 60),
  category: z.enum(["General", "OBC", "SC", "ST", "EWS", "Other"], { message: "Choose a category." }),
  conduct: required("Conduct", 60),
  leavingDate: required("Date of leaving", 10),
  reason: required("Reason for leaving", 200),
  remarks: z.string().trim().max(300),
  acknowledgeDues: z.boolean(),
});

export type TransferFormValues = z.infer<typeof transferSchema>;

const today = () => new Date().toISOString().slice(0, 10);

export const bonafideDefaults = (draft?: ICertificateDraft): BonafideFormValues => ({
  gender: (draft?.answers.gender ?? "") as BonafideFormValues["gender"],
  parentName: draft?.answers.parentName ?? "",
  purposeChoice: "",
  purposeOther: "",
});

export const transferDefaults = (draft?: ICertificateDraft): TransferFormValues => ({
  gender: (draft?.answers.gender ?? "") as TransferFormValues["gender"],
  fatherName: draft?.answers.fatherName || draft?.answers.parentName || "",
  motherName: draft?.answers.motherName ?? "",
  nationality: draft?.answers.nationality ?? "Indian",
  category: (draft?.answers.category ?? "") as TransferFormValues["category"],
  conduct: draft?.answers.conduct ?? "Good",
  leavingDate: today(),
  reason: "",
  remarks: "",
  acknowledgeDues: false,
});
