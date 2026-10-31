import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  candidatesQuery,
  IPromotionDecisionInput,
  processDecisions,
  refreshAfterPromotion,
} from "@/entities/promotion";
import { RunPlanRow, rollNumbersFor, startLane } from "./promotion.utils";

export interface RunProgress {
  state: "running" | "done" | "failed";
  moved?: number;
  failures?: { name: string; message?: string }[];
}

interface SchoolRunInput {
  organizationId: string;
  sourceYearId: string;
  targetYearId: string;
  plan: RunPlanRow[];
}

// runs the plan one section at a time, so progress shows as it goes and one bad section never stops the rest
export const useSchoolRun = ({ organizationId, sourceYearId, targetYearId, plan }: SchoolRunInput) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState<Record<string, RunProgress>>({});
  const [running, setRunning] = useState(false);
  // the plan as it was when the run started; the live one empties as students move
  const [ranPlan, setRanPlan] = useState<RunPlanRow[]>([]);
  const finished = !running && Object.keys(progress).length > 0;

  const mark = (sectionId: string, next: RunProgress) => setProgress((prev) => ({ ...prev, [sectionId]: next }));

  const decisionsFor = async (row: RunPlanRow, used: Record<string, number>) => {
    const { items } = await queryClient.fetchQuery({
      ...candidatesQuery(organizationId, sourceYearId, row.section.id),
      staleTime: 0,
    });
    const decisions: IPromotionDecisionInput[] = [];
    const place = (lane: "promote" | "detain", to: RunPlanRow["promoteTo"]) => {
      const students = items.filter((candidate) => startLane(candidate, row.isFinal) === lane);
      if (!to || !students.length) return;
      const rolls = rollNumbersFor(
        students.map(({ student }) => student),
        (to.studentCount ?? 0) + (used[to.id] ?? 0)
      );
      used[to.id] = (used[to.id] ?? 0) + students.length;
      students.forEach(({ student }) =>
        decisions.push({
          studentId: student.id,
          action: lane,
          academicYearId: targetYearId,
          classId: to.classId,
          sectionId: to.id,
          rollNumber: rolls[student.id],
        })
      );
    };
    place("promote", row.promoteTo);
    place("detain", row.repeatIn);
    items
      .filter((candidate) => startLane(candidate, row.isFinal) === "pass_out")
      .forEach(({ student }) => decisions.push({ studentId: student.id, action: "pass_out" }));
    return { decisions, names: new Map(items.map(({ student }) => [student.id, student.name])) };
  };

  const run = async () => {
    setRunning(true);
    setProgress({});
    setRanPlan(plan);
    // seats taken earlier in this run, so two sections landing in one section never share roll numbers
    const used: Record<string, number> = {};
    for (const row of plan) {
      mark(row.section.id, { state: "running" });
      try {
        const { decisions, names } = await decisionsFor(row, used);
        const { items } = decisions.length ? await processDecisions(organizationId, decisions) : { items: [] };
        const failures = items
          .filter((item) => !item.success)
          .map((item) => ({ name: names.get(item.studentId) ?? "", message: item.message }));
        mark(row.section.id, {
          state: failures.length ? "failed" : "done",
          moved: items.length - failures.length,
          failures,
        });
      } catch {
        mark(row.section.id, {
          state: "failed",
          failures: [{ name: row.label, message: "This section could not be run." }],
        });
      }
    }
    refreshAfterPromotion(queryClient, organizationId);
    setRunning(false);
  };

  const close = () => {
    if (running) return;
    setOpen(false);
    setProgress({});
  };

  return { open, setOpen, close, run, running, finished, progress, plan: running || finished ? ranPlan : plan };
};
