import { useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { useGetAcademicYears, useGetClasses, useGetYearSections } from "@/entities/academics";
import { useGetPromotionCandidates, useGetPromotionOverview, useProcessPromotions } from "@/entities/promotion";
import { useSchoolRun } from "./school-run-controller";
import { IPromotionCandidate } from "@/entities/promotion";
import { ISection } from "@/entities/academics";
import {
  LANES,
  Lane,
  classAfter,
  inSchoolOrder,
  nextYearOf,
  planSchoolRun,
  rollNumbersFor,
  sectionIn,
  startLane,
} from "./promotion.utils";

// the two lanes that land in a class of the next year
export type Placed = "promote" | "detain";
export type LeaveAction = "transfer" | "withdraw";
interface Destination {
  classId?: string;
  sectionId?: string;
}
export interface Outcome {
  name: string;
  lane: Lane;
  success: boolean;
  message?: string;
}

export const usePromotionController = () => {
  const { organizationId = "" } = useParams();

  const years = useGetAcademicYears(organizationId).data?.items || [];
  const [pickedSourceYearId, setPickedSourceYearId] = useState("");
  const [pickedTargetYearId, setPickedTargetYearId] = useState("");
  const [sourceSectionId, setSourceSectionId] = useState("");
  // only what the user changed is kept; everything else follows the smart defaults
  const [moved, setMoved] = useState<Record<string, Lane>>({});
  const [pickedDestination, setPickedDestination] = useState<Partial<Record<Placed, Destination>>>({});
  const [leaveAction, setLeaveAction] = useState<LeaveAction>("transfer");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [lastRun, setLastRun] = useState<Outcome[]>([]);

  const sourceYearId = pickedSourceYearId || years.find((year) => year.isCurrent)?.id || "";
  const targetYear = years.find((year) => year.id === pickedTargetYearId) ?? nextYearOf(years, sourceYearId);
  const targetYearId = targetYear?.id || "";

  const sourceClasses = useGetClasses(organizationId, sourceYearId).data?.items || [];
  const sourceSections = useGetYearSections(organizationId, sourceYearId).data?.items || [];
  const targetClasses = useGetClasses(organizationId, targetYearId, "active").data?.items || [];
  const targetSections = useGetYearSections(organizationId, targetYearId).data?.items || [];
  const candidatesQuery = useGetPromotionCandidates(organizationId, sourceYearId, sourceSectionId);
  const processPromotions = useProcessPromotions(organizationId);
  const candidates = candidatesQuery.data?.items || [];
  const overview = useGetPromotionOverview(organizationId, sourceYearId);
  const stats = new Map((overview.data?.items || []).map((row) => [row.sectionId, row]));

  const classById = (id?: string) => [...sourceClasses, ...targetClasses].find((klass) => klass.id === id);
  const sourceSection = sourceSections.find((section) => section.id === sourceSectionId);
  const sourceClass = classById(sourceSection?.classId);
  // nothing above this class in the school: passing students leave instead of moving up
  const ordered = inSchoolOrder(sourceClasses);
  // a switched-off class never counts as the next or final one
  const activeSourceClasses = sourceClasses.filter((klass) => klass.status !== "inactive");
  const isFinalClass = !!sourceClass && inSchoolOrder(activeSourceClasses).at(-1)?.id === sourceClass.id;
  const placeOf = (classId: string) => ordered.findIndex((klass) => klass.id === classId);

  // the school map: every class in order, its sections with their progress
  const mapRows = ordered.map((klass) => ({
    klass,
    sections: sourceSections
      .filter((section) => section.classId === klass.id)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((section) => ({ section, stats: stats.get(section.id) })),
  }));
  const plan = planSchoolRun({
    sourceClasses: activeSourceClasses,
    sourceSections,
    targetClasses,
    targetSections,
    stats,
  });
  const schoolRun = useSchoolRun({ organizationId, sourceYearId, targetYearId, plan });

  const sourceOptions = [...sourceSections]
    .sort((a, b) => placeOf(a.classId) - placeOf(b.classId) || a.name.localeCompare(b.name))
    .map((section) => ({
      id: section.id,
      name: `${classById(section.classId)?.name ?? "Class"} · ${section.name}`,
      description: `${section.studentCount ?? 0} student(s)`,
    }));

  const defaultDestination = (lane: Placed): Destination => {
    const klass = classAfter(activeSourceClasses, targetClasses, sourceClass, lane === "promote" ? 1 : 0);
    return { classId: klass?.id, sectionId: sectionIn(targetSections, klass?.id, sourceSection?.name)?.id };
  };
  const destinationOf = (lane: Placed) => pickedDestination[lane] ?? defaultDestination(lane);
  const destinationSection = (lane: Placed) =>
    targetSections.find((section) => section.id === destinationOf(lane).sectionId);

  const laneOf = (candidate: IPromotionCandidate) => moved[candidate.student.id] ?? startLane(candidate, isFinalClass);
  const lanes = Object.fromEntries(
    LANES.map(({ key }) => [key, candidates.filter((candidate) => laneOf(candidate) === key)])
  ) as Record<Lane, IPromotionCandidate[]>;
  // pass out only makes sense from the final class, unless someone was moved there by hand
  const visibleLanes = LANES.filter(({ key }) => key !== "pass_out" || isFinalClass || lanes.pass_out.length);

  const rollNumbers = (["promote", "detain"] as Placed[]).reduce<Record<string, string>>(
    (all, lane) => ({
      ...all,
      ...rollNumbersFor(
        lanes[lane].map(({ student }) => student),
        destinationSection(lane)?.studentCount ?? 0
      ),
    }),
    {}
  );

  const seatsOf = (lane: Placed) => {
    const section = destinationSection(lane);
    const taken = (section?.studentCount ?? 0) + lanes[lane].length;
    return { taken, capacity: section?.capacity, full: !!section?.capacity && taken > section.capacity };
  };

  // why the board can't be applied yet, if anything stops it
  const blockerOf = () => {
    const placing = (["promote", "detain"] as Placed[]).filter((lane) => lanes[lane].length);
    if (placing.length && !targetYearId) return "Add next academic year first, so students have somewhere to go.";
    const missing = placing.find((lane) => !destinationOf(lane).sectionId);
    if (missing)
      return `Choose the class and section for the ${missing === "promote" ? "promoted" : "repeating"} students.`;
    const full = placing.find((lane) => seatsOf(lane).full);
    if (full) return `The ${full === "promote" ? "promotion" : "repeat"} section is over capacity.`;
    return "";
  };
  const blocker = blockerOf();
  const decidedCount = candidates.length - lanes.decide.length;

  const resetBoard = () => {
    setMoved({});
    setPickedDestination({});
    setLastRun([]);
  };
  const pickSourceYear = (id: string) => {
    setPickedSourceYearId(id);
    setPickedTargetYearId("");
    setSourceSectionId("");
    resetBoard();
  };
  const pickSourceSection = (id: string) => {
    setSourceSectionId(id);
    resetBoard();
  };
  const pickTargetYear = (id: string) => {
    setPickedTargetYearId(id);
    setPickedDestination({});
  };
  const pickDestinationClass = (lane: Placed, classId: string) =>
    setPickedDestination((prev) => ({
      ...prev,
      [lane]: { classId, sectionId: sectionIn(targetSections, classId, sourceSection?.name)?.id },
    }));
  const pickDestinationSection = (lane: Placed, sectionId: string) =>
    setPickedDestination((prev) => ({ ...prev, [lane]: { ...destinationOf(lane), sectionId } }));

  const moveTo = (studentIds: string[], lane: Lane) =>
    setMoved((prev) => ({ ...prev, ...Object.fromEntries(studentIds.map((id) => [id, lane])) }));
  const moveAll = (from: Lane, to: Lane) =>
    moveTo(
      lanes[from].map(({ student }) => student.id),
      to
    );

  const decisionFor = (candidate: IPromotionCandidate) => {
    const lane = laneOf(candidate);
    const studentId = candidate.student.id;
    if (lane === "promote" || lane === "detain") {
      const { classId, sectionId } = destinationOf(lane);
      return {
        studentId,
        action: lane,
        academicYearId: targetYearId,
        classId,
        sectionId,
        rollNumber: rollNumbers[studentId],
      };
    }
    return { studentId, action: lane === "leave" ? leaveAction : ("pass_out" as const) };
  };

  const apply = () => {
    const deciding = candidates.filter((candidate) => laneOf(candidate) !== "decide");
    processPromotions.mutate(deciding.map(decisionFor), {
      onSuccess: (data) => {
        const byStudent = new Map(data.items.map((item) => [item.studentId, item]));
        const outcomes = deciding.map((candidate) => ({
          name: candidate.student.name,
          lane: laneOf(candidate),
          success: byStudent.get(candidate.student.id)?.success ?? false,
          message: byStudent.get(candidate.student.id)?.message,
        }));
        setLastRun(outcomes);
        setConfirmOpen(false);
        const failed = outcomes.filter((outcome) => !outcome.success).length;
        if (failed) toast.error(`${failed} of ${outcomes.length} could not be moved, see below.`);
        else toast.success(`${outcomes.length} student(s) moved.`);
      },
      onError: (error) => {
        setConfirmOpen(false);
        toast.error(error?.response?.Error?.message || "Could not apply the promotion");
      },
    });
  };

  const placeLabel = (lane: Placed) => {
    const section: ISection | undefined = destinationSection(lane);
    return section ? `${classById(section.classId)?.name ?? ""} · ${section.name}` : "";
  };

  return {
    mapRows,
    isLoadingMap: overview.isLoading,
    mapError: overview.isError,
    retryMap: overview.refetch,
    plan,
    schoolRun,
    classNameOf: (id: string) => classById(id)?.name ?? "",
    years,
    sourceYearId,
    pickSourceYear,
    sourceOptions,
    sourceSectionId,
    pickSourceSection,
    sourceLabel: sourceOptions.find((option) => option.id === sourceSectionId)?.name ?? "",
    targetYear,
    pickTargetYear,
    targetClasses,
    targetSections,
    destinationOf,
    pickDestinationClass,
    pickDestinationSection,
    placeLabel,
    seatsOf,
    leaveAction,
    setLeaveAction,
    isFinalClass,
    candidates,
    isLoading: candidatesQuery.isLoading,
    lanes,
    visibleLanes,
    rollNumbers,
    moveTo,
    moveAll,
    blocker,
    decidedCount,
    confirmOpen,
    setConfirmOpen,
    apply,
    isApplying: processPromotions.isPending,
    lastRun,
  };
};

export type PromotionController = ReturnType<typeof usePromotionController>;
