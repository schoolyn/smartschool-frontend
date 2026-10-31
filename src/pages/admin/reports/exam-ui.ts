import { BadgeTone } from "@/shared/ui/kit/badge";
import { ExamStage } from "@/entities/exam";
import { SelectOption } from "@/shared/types";

export const EXAM_TYPE_OPTIONS: SelectOption[] = [
  { id: "unit_test", name: "Unit test" },
  { id: "mid_term", name: "Mid term" },
  { id: "final", name: "Final" },
  { id: "other", name: "Other" },
];

export const examTypeLabel = (type: string) => EXAM_TYPE_OPTIONS.find((option) => option.id === type)?.name ?? type;

// the four steps an exam goes through, in order
export const EXAM_STAGES: { key: ExamStage; label: string; tone: BadgeTone; hint: string }[] = [
  { key: "setup", label: "Setting up", tone: "gray", hint: "Add the subjects each class is tested on" },
  { key: "marks", label: "Entering marks", tone: "yellow", hint: "Teachers enter marks, then you verify them" },
  { key: "ready", label: "Ready to publish", tone: "blue", hint: "Every mark is entered and verified" },
  { key: "published", label: "Published", tone: "green", hint: "Parents can see the results" },
];

export const stageOf = (stage: ExamStage = "setup") => EXAM_STAGES.find((item) => item.key === stage) ?? EXAM_STAGES[0];

const day = (date: string) => new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
const year = (date: string) => new Date(date).getFullYear();

// "21 Jul - 26 Jul 2026", with the year once when both dates share it
export const dateRange = (start: string, end: string) =>
  year(start) === year(end)
    ? `${day(start)} - ${day(end)} ${year(end)}`
    : `${day(start)} ${year(start)} - ${day(end)} ${year(end)}`;
