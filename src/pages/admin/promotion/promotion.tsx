import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { ArrowTrendingUpIcon, Squares2X2Icon } from "@heroicons/react/24/outline";

import SectionHeader from "@/shared/ui/section-header";
import Spinner from "@/shared/ui/spinner";
import EmptyState from "@/shared/ui/empty-state";
import ErrorState from "@/shared/ui/error-state";
import CustomSelectDropdown from "@/shared/ui/custom-select";
import DeleteConfirmationDialog from "@/shared/ui/delete-confirmation-dialog";
import { Button } from "@/shared/ui/kit/button";
import { cn } from "@/shared/lib/utils";
import { usePromotionController, LeaveAction, Placed } from "./promotion-controller";
import { LANES, Lane } from "./promotion.utils";
import BoardLane from "./components/board-lane";
import StudentCard, { CardBody } from "./components/student-card";
import DestinationPicker from "./components/destination-picker";
import { LANE_TONE } from "./components/lane-tone";
import SchoolMap from "./components/school-map";
import MapSummary from "./components/map-summary";
import SchoolRunDialog from "./components/school-run-dialog";

const LEAVE_OPTIONS: { key: LeaveAction; title: string }[] = [
  { key: "transfer", title: "Transfer" },
  { key: "withdraw", title: "Withdraw" },
];

const Promotion = () => {
  const c = usePromotionController();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  // a short move before a drag starts, so a click still opens a card's menu
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor)
  );

  const titleOf = (lane: Lane) => LANES.find((item) => item.key === lane)?.title ?? lane;
  const dragging = c.candidates.find((candidate) => candidate.student.id === draggingId);
  const onDragStart = ({ active }: DragStartEvent) => setDraggingId(String(active.id));
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setDraggingId(null);
    if (over) c.moveTo([String(active.id)], over.id as Lane);
  };

  const yearOptions = c.years.map((year) => ({ id: year.id, name: year.name }));
  const placedControls = (lane: Placed) => {
    const destination = c.destinationOf(lane);
    return (
      <DestinationPicker
        label={lane}
        classes={c.targetClasses}
        sections={c.targetSections}
        classId={destination.classId}
        sectionId={destination.sectionId}
        seats={c.seatsOf(lane)}
        onClass={(id) => c.pickDestinationClass(lane, id)}
        onSection={(id) => c.pickDestinationSection(lane, id)}
      />
    );
  };
  const laneControls: Partial<Record<Lane, React.ReactNode>> = {
    promote: c.targetYear && placedControls("promote"),
    detain: c.targetYear && placedControls("detain"),
    leave: (
      <div className="inline-flex rounded-lg bg-gray-100 p-0.5" role="radiogroup" aria-label="Leaving as">
        {LEAVE_OPTIONS.map((option) => (
          <button
            key={option.key}
            type="button"
            role="radio"
            aria-checked={c.leaveAction === option.key}
            onClick={() => c.setLeaveAction(option.key)}
            className={cn(
              "rounded-md px-3 py-1 text-xs font-medium",
              c.leaveAction === option.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
            )}
          >
            {option.title}
          </button>
        ))}
      </div>
    ),
  };

  const summary = c.visibleLanes
    .filter(({ key }) => key !== "decide" && c.lanes[key].length)
    .map(({ key }) => {
      const where = key === "promote" || key === "detain" ? ` to ${c.placeLabel(key)}` : "";
      const what = key === "leave" ? (c.leaveAction === "transfer" ? "Transfer" : "Withdraw") : titleOf(key);
      return `${what}: ${c.lanes[key].length}${where}`;
    });
  // why the whole-school run is unavailable, if it is
  const runBlocker = !c.targetYear
    ? "Add next academic year first"
    : c.isLoadingMap || c.mapError
      ? "Promotion progress is not loaded yet"
      : !c.plan.length
        ? "No section has results yet"
        : undefined;
  const failed = c.lastRun.filter((outcome) => !outcome.success);

  return (
    <div className="mx-auto max-w-7xl space-y-5 pb-24">
      <SectionHeader
        title="Student Promotion"
        description={
          c.sourceSectionId
            ? "Drag students into lanes to decide where each one goes next year"
            : "See every class at a glance, open a section to decide, or promote the whole school at once"
        }
        action={{
          label: "Promote whole school",
          icon: ArrowTrendingUpIcon,
          onClick: () => c.schoolRun.setOpen(true),
          hidden: !!c.sourceSectionId,
          disabled: !!runBlocker,
          title: runBlocker,
        }}
        secondaryActions={[
          {
            label: "School map",
            icon: Squares2X2Icon,
            onClick: () => c.pickSourceSection(""),
            hidden: !c.sourceSectionId,
          },
        ]}
      />

      <div className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow lg:flex-row lg:items-end">
        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
          <CustomSelectDropdown
            label="From year"
            options={yearOptions}
            value={yearOptions.find((year) => year.id === c.sourceYearId) ?? null}
            onChange={(picked) => c.pickSourceYear(String(picked.id))}
          />
          <CustomSelectDropdown
            label="Class and section"
            placeholder="Pick a section"
            disabled={!c.sourceYearId}
            options={c.sourceOptions}
            value={c.sourceOptions.find((section) => section.id === c.sourceSectionId) ?? null}
            onChange={(picked) => c.pickSourceSection(String(picked.id))}
            emptyText="No sections in this year yet."
          />
        </div>
        <ArrowRightIcon className="hidden h-5 w-5 shrink-0 text-gray-400 lg:mb-2.5 lg:block" />
        <div className="lg:w-64">
          <CustomSelectDropdown
            label="To year"
            placeholder="Next year"
            options={yearOptions.filter((year) => year.id !== c.sourceYearId)}
            value={c.targetYear ? { id: c.targetYear.id, name: c.targetYear.name } : null}
            onChange={(picked) => c.pickTargetYear(String(picked.id))}
            emptyText="Add next academic year first."
          />
        </div>
      </div>

      {!c.targetYear && c.sourceYearId && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          There is no academic year after this one yet. Add it under Academics so promoted and repeating students have
          classes to move into. Pass out and leaving work without it.
        </p>
      )}

      {c.lastRun.length > 0 && (
        <div className="rounded-xl bg-white p-4 shadow">
          <p className="text-sm font-medium text-gray-900">
            {c.lastRun.length - failed.length} of {c.lastRun.length} student(s) moved
          </p>
          {failed.length > 0 && (
            <ul className="mt-2 divide-y divide-gray-100 text-sm">
              {failed.map((outcome) => (
                <li key={outcome.name} className="flex justify-between gap-4 py-1.5">
                  <span className="text-gray-900">
                    {outcome.name} <span className="text-gray-500">({titleOf(outcome.lane)})</span>
                  </span>
                  <span className="text-red-600">{outcome.message}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {!c.sourceSectionId ? (
        c.sourceOptions.length ? (
          <>
            <MapSummary rows={c.mapRows} />
            {c.isLoadingMap ? (
              <Spinner />
            ) : c.mapError ? (
              <ErrorState title="Could not load promotion progress" onRetry={() => c.retryMap()} />
            ) : (
              <SchoolMap rows={c.mapRows} onOpen={c.pickSourceSection} />
            )}
          </>
        ) : (
          <div className="rounded-xl bg-white shadow">
            <EmptyState
              title="Nothing to promote yet"
              description="Promotion works on students enrolled in classes. Add classes, sections and students first."
            />
          </div>
        )
      ) : c.isLoading ? (
        <Spinner />
      ) : !c.candidates.length ? (
        <div className="rounded-xl bg-white shadow">
          <EmptyState
            title="No students left in this section"
            description="Everyone here has already been moved, or the section is empty."
          />
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragCancel={() => setDraggingId(null)}
        >
          <div className="flex gap-3 overflow-x-auto pb-2">
            {c.visibleLanes.map(({ key, title, hint }) => {
              const others = c.visibleLanes.filter((lane) => lane.key !== key);
              return (
                <BoardLane
                  key={key}
                  lane={key}
                  title={title}
                  hint={key === "pass_out" && !c.isFinalClass ? "Usually only from the final class" : hint}
                  count={c.lanes[key].length}
                  controls={laneControls[key]}
                  menu={others.map((lane) => ({
                    label: `Move all to ${lane.title}`,
                    onSelect: () => c.moveAll(key, lane.key),
                  }))}
                >
                  {c.lanes[key].map((candidate) => (
                    <StudentCard
                      key={candidate.student.id}
                      candidate={candidate}
                      rollNumber={c.rollNumbers[candidate.student.id]}
                      moveOptions={others}
                      onMove={(lane) => c.moveTo([candidate.student.id], lane)}
                    />
                  ))}
                </BoardLane>
              );
            })}
          </div>
          <DragOverlay>
            {dragging && (
              <CardBody
                candidate={dragging}
                className="w-72 cursor-grabbing rotate-1 shadow-xl ring-2 ring-primary-500"
              />
            )}
          </DragOverlay>
        </DndContext>
      )}

      {c.candidates.length > 0 && c.sourceSectionId && (
        <div className="sticky bottom-0 z-10 -mx-1 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-xl sm:flex-row sm:items-center">
          <div className="flex flex-1 flex-wrap items-center gap-2 text-sm">
            <span className="font-medium text-gray-900">
              {c.decidedCount} of {c.candidates.length} decided
            </span>
            {c.visibleLanes
              .filter(({ key }) => key !== "decide" && c.lanes[key].length)
              .map(({ key, title }) => (
                <span key={key} className={cn("rounded-full px-2 py-0.5 text-xs font-medium", LANE_TONE[key].count)}>
                  {c.lanes[key].length} {title.toLowerCase()}
                </span>
              ))}
            {c.blocker && <span className="text-xs text-amber-700">{c.blocker}</span>}
          </div>
          <Button disabled={!c.decidedCount || !!c.blocker || c.isApplying} onClick={() => c.setConfirmOpen(true)}>
            Review and apply
          </Button>
        </div>
      )}

      <SchoolRunDialog
        open={c.schoolRun.open}
        onClose={c.schoolRun.close}
        onRun={c.schoolRun.run}
        running={c.schoolRun.running}
        finished={c.schoolRun.finished}
        plan={c.schoolRun.plan}
        progress={c.schoolRun.progress}
        sourceYearName={c.years.find((year) => year.id === c.sourceYearId)?.name ?? ""}
        targetYearName={c.targetYear?.name ?? ""}
        classNameOf={c.classNameOf}
      />

      <DeleteConfirmationDialog
        open={c.confirmOpen}
        onClose={() => c.setConfirmOpen(false)}
        onConfirm={c.apply}
        isLoading={c.isApplying}
        tone="neutral"
        title={`Apply to ${c.sourceLabel}?`}
        description={
          <span className="block space-y-1">
            {summary.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
            {c.lanes.decide.length > 0 && (
              <span className="block text-gray-500">{c.lanes.decide.length} undecided stay where they are.</span>
            )}
            <span className="block pt-2">Students move right away; this cannot be undone from here.</span>
          </span>
        }
        confirmLabel="Apply"
      />
    </div>
  );
};

export default Promotion;
