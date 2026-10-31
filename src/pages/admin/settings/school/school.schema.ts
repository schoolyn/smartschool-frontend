import { z } from "zod";

export const schoolDetailsSchema = z.object({
  name: z.string().trim().min(1, "School name is required."),
  address: z.string().trim().min(1, "Address is required."),
  pincode: z.string().trim().min(1, "Pincode is required."),
  description: z.string().trim().max(300),
});

export type SchoolDetailsFormValues = z.infer<typeof schoolDetailsSchema>;
