import { CheckIcon } from "@heroicons/react/20/solid";

import { cn } from "@/shared/lib/utils";
import { ExamStage } from "@/entities/exam";
import { EXAM_STAGES } from "../../exam-ui";

// the four steps of an exam, with the done ones ticked and the current one marked
const ExamStageSteps = ({ stage }: { stage: ExamStage }) => {
  const current = EXAM_STAGES.findIndex((step) => step.key === stage);
  return (
    <ol className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {EXAM_STAGES.map((step, index) => {
        const done = index < current || stage === "published";
        const active = index === current && stage !== "published";
        return (
          <li key={step.key} className="flex items-start gap-3">
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                done && "border-primary-600 bg-primary-600 text-white",
                active && "border-primary-600 text-primary-700 ring-4 ring-primary-100",
                !done && !active && "border-gray-300 text-gray-400"
              )}
            >
              {done ? <CheckIcon className="h-4 w-4" /> : index + 1}
            </span>
            <div className="min-w-0">
              <p className={cn("text-sm font-medium", done || active ? "text-gray-900" : "text-gray-500")}>
                {step.label}
              </p>
              <p className="text-xs text-gray-500">{step.hint}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
};

export default ExamStageSteps;
