import { z } from "zod";

// most rows one export may hold
export const EXPORT_CAP = 5000;

export const exportSchema = (max: number) =>
  z.object({
    count: z
      .string()
      .trim()
      .refine((value) => /^\d+$/.test(value) && Number(value) >= 1, "Enter a whole number of rows.")
      .refine((value) => Number(value) <= max, `You can export up to ${max.toLocaleString("en-IN")} rows.`),
  });

export type ExportFormValues = z.infer<ReturnType<typeof exportSchema>>;
