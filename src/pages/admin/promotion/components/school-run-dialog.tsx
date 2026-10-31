import { ComponentType } from "react";
import {
  AcademicCapIcon,
  ArrowPathIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PauseIcon,
} from "@heroicons/react/20/solid";
import { ArrowTrendingUpIcon } from "@heroicons/react/24/outline";

import { Button } from "@/shared/ui/kit/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/kit/dialog";
import { cn } from "@/shared/lib/utils";
import { RunPlanRow } from "../promotion.utils";
import { RunProgress } from "../school-run-controller";

interface SchoolRunDialogProps {
  open: boolean;
  onClose: () => void;
  onRun: () => void;
  running: boolean;
  finished: boolean;
  plan: RunPlanRow[];
  progress: Record<string, RunProgress>;
  sourceYearName: string;
  targetYearName: string;
  classNameOf: (id: string) => string;
}

type Outcome = "promote" | "repeat" | "pass_out" | "stay";

const OUTCOMES: Record<Outcome, { label: string; icon: ComponentType<{ className?: string }>; tone: string }> = {
  promote: { label: "Promote", icon: ArrowUpIcon, tone: "bg-green-50 text-green-700 border-green-200" },
  repeat: { label: "Repeat", icon: ArrowPathIcon, tone: "bg-amber-50 text-amber-700 border-amber-200" },
  pass_out: { label: "Pass out", icon: AcademicCapIcon, tone: "bg-primary-50 text-primary-700 border-primary-200" },
  stay: { label: "Stay", icon: PauseIcon, tone: "bg-gray-50 text-gray-600 border-gray-200" },
};

// how many of a section's students take each outcome
const countsOf = (row: RunPlanRow): Record<Outcome, number> => ({
  promote: !row.isFinal && row.promoteTo ? row.pass : 0,
  pass_out: row.isFinal ? row.pass : 0,
  repeat: row.repeatIn ? row.fail : 0,
  stay: row.noResult + (!row.isFinal && !row.promoteTo ? row.pass : 0) + (!row.repeatIn ? row.fail : 0),
});

const Chip = ({ outcome, children }: { outcome: Outcome; children: React.ReactNode }) => {
  const { icon: Icon, tone } = OUTCOMES[outcome];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium", tone)}>
      <Icon className="h-3.5 w-3.5" />
      {children}
    </span>
  );
};

const StatusIcon = ({ progress }: { progress?: RunProgress }) => {
  if (!progress) return null;
  if (progress.state === "running")
    return (
      <span
        className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-gray-800"
        aria-label="Running"
      />
    );
  if (progress.state === "done") return <CheckCircleIcon className="h-5 w-5 text-green-600" aria-label="Done" />;
  return <ExclamationCircleIcon className="h-5 w-5 text-red-600" aria-label="Some failed" />;
};

// the whole-school run: totals, what each section does, then live progress while it runs
const SchoolRunDialog = ({
  open,
  onClose,
  onRun,
  running,
  finished,
  plan,
  progress,
  sourceYearName,
  targetYearName,
  classNameOf,
}: SchoolRunDialogProps) => {
  const totals = plan.map(countsOf).reduce(
    (sum, row) => ({
      promote: sum.promote + row.promote,
      repeat: sum.repeat + row.repeat,
      pass_out: sum.pass_out + row.pass_out,
      stay: sum.stay + row.stay,
    }),
    { promote: 0, repeat: 0, pass_out: 0, stay: 0 }
  );
  const moving = totals.promote + totals.repeat + totals.pass_out;
  const done = Object.values(progress).filter((item) => item.state !== "running").length;
  const moved = Object.values(progress).reduce((sum, item) => sum + (item.moved ?? 0), 0);
  const failed = Object.values(progress).reduce((sum, item) => sum + (item.failures?.length ?? 0), 0);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        showDefaultClose={!running}
        className="max-w-2xl"
        onInteractOutside={(event) => running && event.preventDefault()}
      >
        <DialogHeader className="block space-y-4 p-5">
          <div className="flex items-start gap-3 pr-8">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700">
              <ArrowTrendingUpIcon className="h-5 w-5" />
            </span>
            <div>
              <DialogTitle>Promote the whole school</DialogTitle>
              <DialogDescription className="mt-0.5 flex items-center gap-1.5">
                {sourceYearName} <ArrowRightIcon className="h-3.5 w-3.5" /> {targetYearName}
              </DialogDescription>
            </div>
          </div>

          {running || finished ? (
            <div>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-900">
                  {finished
                    ? `${moved} student(s) moved`
                    : `Moving section ${Math.min(done + 1, plan.length)} of ${plan.length}`}
                </span>
                {failed > 0 && <span className="text-red-600">{failed} could not be moved</span>}
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-green-500 transition-all"
                  style={{ width: `${(done / Math.max(plan.length, 1)) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(Object.keys(OUTCOMES) as Outcome[]).map((outcome) => {
                const { label, icon: Icon, tone } = OUTCOMES[outcome];
                return (
                  <div key={outcome} className={cn("rounded-lg border px-3 py-2", tone)}>
                    <p className="flex items-center gap-1 text-xs font-medium">
                      <Icon className="h-3.5 w-3.5" /> {label}
                    </p>
                    <p className="mt-0.5 text-xl font-semibold">{totals[outcome]}</p>
                  </div>
                );
              })}
            </div>
          )}
        </DialogHeader>

        <DialogBody>
          <ul className="divide-y divide-gray-100">
            {plan.map((row) => {
              const counts = countsOf(row);
              const rowProgress = progress[row.section.id];
              return (
                <li key={row.section.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm font-semibold text-gray-700">
                    {row.section.name}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">{row.label}</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {counts.promote > 0 && row.promoteTo && (
                        <Chip outcome="promote">
                          {counts.promote} to {classNameOf(row.promoteTo.classId)} · {row.promoteTo.name}
                        </Chip>
                      )}
                      {counts.pass_out > 0 && <Chip outcome="pass_out">{counts.pass_out} pass out</Chip>}
                      {counts.repeat > 0 && <Chip outcome="repeat">{counts.repeat} repeat</Chip>}
                      {counts.stay > 0 && <Chip outcome="stay">{counts.stay} stay</Chip>}
                    </div>
                    {row.note && <p className="mt-1 text-xs text-amber-700">{row.note}; those students stay.</p>}
                    {rowProgress?.failures?.map((failure, index) => (
                      <p key={`${failure.name}-${index}`} className="mt-1 text-xs text-red-600">
                        {failure.name}: {failure.message}
                      </p>
                    ))}
                  </div>
                  <StatusIcon progress={rowProgress} />
                </li>
              );
            })}
          </ul>
        </DialogBody>

        <DialogFooter className="items-center px-5">
          {finished ? (
            <Button onClick={onClose}>Done</Button>
          ) : (
            <>
              <Button onClick={onRun} loading={running} disabled={!moving}>
                {!running && `Move ${moving} student(s)`}
              </Button>
              <Button variant="secondary" onClick={onClose} disabled={running}>
                Cancel
              </Button>
              <p className="mr-auto text-xs text-gray-500">
                {totals.stay ? "Students who stay can be decided later on the board." : "Students move right away."}
              </p>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SchoolRunDialog;
