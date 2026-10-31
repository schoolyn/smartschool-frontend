import { z } from "zod";

export const marksRowSchema = z.object({
  studentId: z.string(),
  theoryMarks: z.string(),
  practicalMarks: z.string(),
  isAbsent: z.boolean(),
});
export const marksSheetSchema = z.object({ rows: z.array(marksRowSchema) });
export type MarksSheetFormValues = z.infer<typeof marksSheetSchema>;
