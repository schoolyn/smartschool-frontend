import { z } from "zod";

const percent = z
  .string()
  .trim()
  .min(1, "Required.")
  .refine((value) => Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= 100, "Enter 0 to 100.");

// a band is a grade, its starting percentage and grade point; its end follows from the next band up
export const gradingSchemeSchema = z
  .object({
    name: z.string().trim().min(1, "Enter a name."),
    passPercent: percent,
    bands: z
      .array(
        z.object({
          grade: z.string().trim().min(1, "Enter a grade."),
          minPercent: percent,
          gradePoint: z
            .string()
            .trim()
            .min(1, "Required.")
            .refine((value) => Number.isFinite(Number(value)) && Number(value) >= 0, "Enter 0 or more."),
        })
      )
      .min(1, "Add at least one grade."),
  })
  .superRefine((values, ctx) => {
    const seen = new Map<string, number>();
    values.bands.forEach((band, index) => {
      const key = band.grade.trim().toLowerCase();
      if (key && seen.has(key))
        ctx.addIssue({ code: "custom", path: ["bands", index, "grade"], message: "Already used." });
      seen.set(key, index);
    });
    const starts = values.bands.map((band) => band.minPercent.trim());
    starts.forEach((start, index) => {
      if (start && starts.indexOf(start) !== index) {
        ctx.addIssue({ code: "custom", path: ["bands", index, "minPercent"], message: "Two grades start here." });
      }
    });
    if (starts.every((start) => start !== "") && !starts.some((start) => Number(start) === 0)) {
      ctx.addIssue({
        code: "custom",
        path: ["bands"],
        message: "The lowest grade must start at 0% so every mark gets a grade.",
      });
    }
  });
export type GradingSchemeFormValues = z.infer<typeof gradingSchemeSchema>;
export const defaultGradingSchemeValues = (): GradingSchemeFormValues => ({
  name: "",
  passPercent: "33",
  bands: [{ grade: "", minPercent: "", gradePoint: "" }],
});

// the CBSE 9-point scale most schools follow, as a starting point
export const CBSE_SCALE: GradingSchemeFormValues["bands"] = [
  ["A1", 91, 10],
  ["A2", 81, 9],
  ["B1", 71, 8],
  ["B2", 61, 7],
  ["C1", 51, 6],
  ["C2", 41, 5],
  ["D", 33, 4],
  ["E", 0, 0],
].map(([grade, minPercent, gradePoint]) => ({
  grade: String(grade),
  minPercent: String(minPercent),
  gradePoint: String(gradePoint),
}));

// highest band first; each ends just below where the next one up starts, the top one at 100
export const toSchemeBands = (bands: GradingSchemeFormValues["bands"]) =>
  [...bands]
    .map((band) => ({
      grade: band.grade.trim(),
      minPercent: Number(band.minPercent),
      gradePoint: Number(band.gradePoint),
    }))
    .sort((a, b) => b.minPercent - a.minPercent)
    .map((band, index, sorted) => ({
      ...band,
      maxPercent: index === 0 ? 100 : Math.round((sorted[index - 1].minPercent - 0.01) * 100) / 100,
    }));

export const examSchema = z
  .object({
    name: z.string().trim().min(1, "Enter a name."),
    term: z.string().trim(),
    type: z.string().min(1),
    startDate: z.string().min(1, "Pick a start date."),
    endDate: z.string().min(1, "Pick an end date."),
    classIds: z.array(z.string()).min(1, "Pick at least one class."),
    gradingSchemeId: z.string().min(1, "Pick a grading scheme."),
  })
  .refine((value) => !value.startDate || !value.endDate || value.endDate >= value.startDate, {
    path: ["endDate"],
    message: "The exam can't end before it starts.",
  });
export type ExamFormValues = z.infer<typeof examSchema>;
export const defaultExamValues: ExamFormValues = {
  name: "",
  term: "",
  type: "mid_term",
  startDate: "",
  endDate: "",
  classIds: [],
  gradingSchemeId: "",
};

const wholeNumber = (label: string) =>
  z
    .string()
    .trim()
    .min(1, "Required.")
    .refine((value) => Number.isFinite(Number(value)) && Number(value) >= 0, `Enter ${label}.`);

// one paper's marks: pass marks within the maximum, and a practical maximum when it has a practical
export const subjectMarksSchema = z
  .object({
    maxMarks: wholeNumber("the maximum"),
    passMarks: wholeNumber("the pass marks"),
    hasPractical: z.boolean(),
    practicalMaxMarks: z.string().trim(),
  })
  .superRefine((row, ctx) => {
    if (Number(row.maxMarks) <= 0) ctx.addIssue({ code: "custom", path: ["maxMarks"], message: "Must be above 0." });
    if (Number(row.passMarks) > Number(row.maxMarks)) {
      ctx.addIssue({ code: "custom", path: ["passMarks"], message: "Can't be above the maximum." });
    }
    if (row.hasPractical && !(Number(row.practicalMaxMarks) > 0)) {
      ctx.addIssue({ code: "custom", path: ["practicalMaxMarks"], message: "Enter the practical maximum." });
    }
  });
export type SubjectMarksFormValues = z.infer<typeof subjectMarksSchema>;

export const examSubjectsSchema = z.object({
  rows: z
    .array(z.intersection(z.object({ subjectId: z.string().min(1, "Pick a subject.") }), subjectMarksSchema))
    .min(1, "Add at least one subject."),
});
export type ExamSubjectsFormValues = z.infer<typeof examSubjectsSchema>;
export const defaultExamSubjectRow = {
  subjectId: "",
  maxMarks: "100",
  passMarks: "33",
  hasPractical: false,
  practicalMaxMarks: "",
};
