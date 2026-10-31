import { IAcademicYear, IClass, ISection } from "@/entities/academics";
import { IPromotionCandidate } from "@/entities/promotion";

// the lanes of the board, in the order they show
export type Lane = "decide" | "promote" | "detain" | "pass_out" | "leave";

export const LANES: { key: Lane; title: string; hint: string }[] = [
  { key: "decide", title: "To decide", hint: "No published result yet" },
  { key: "promote", title: "Promote", hint: "Move up to the next class" },
  { key: "detain", title: "Repeat", hint: "Stay in the same class next year" },
  { key: "pass_out", title: "Pass out", hint: "Finished the final class; records are kept" },
  { key: "leave", title: "Leaving school", hint: "Transfer or withdrawal; records are kept" },
];

// where a student starts: their result decides, the final class passes out instead of promoting
export const startLane = (candidate: IPromotionCandidate, isFinalClass: boolean): Lane => {
  const status = candidate.result?.promotionStatus;
  if (!status || status === "pending") return "decide";
  if (status === "fail") return "detain";
  return isFinalClass ? "pass_out" : "promote";
};

// the year that starts next after the given one
export const nextYearOf = (years: IAcademicYear[], yearId: string) => {
  const current = years.find((year) => year.id === yearId);
  if (!current) return undefined;
  return [...years]
    .filter((year) => new Date(year.startDate) > new Date(current.startDate))
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];
};

// classes in school order: by level or set order, then naturally by name ("Grade 9" before "Grade 10")
export const inSchoolOrder = (classes: IClass[]) =>
  [...classes].sort(
    (a, b) =>
      (a.numericLevel ?? a.sequence ?? 0) - (b.numericLevel ?? b.sequence ?? 0) ||
      a.name.localeCompare(b.name, undefined, { numeric: true })
  );

// the class `step` places after the given one, found in the other year by name, else by position
export const classAfter = (
  sourceClasses: IClass[],
  targetClasses: IClass[],
  sourceClass: IClass | undefined,
  step: number
) => {
  const source = inSchoolOrder(sourceClasses);
  const index = source.findIndex((klass) => klass.id === sourceClass?.id);
  const wanted = index < 0 ? undefined : source[index + step];
  if (!wanted) return undefined;
  return targetClasses.find((klass) => klass.name === wanted.name) ?? inSchoolOrder(targetClasses)[index + step];
};

// the section to land in: the one with the same name, or the class's first
export const sectionIn = (sections: ISection[], classId: string | undefined, sectionName: string | undefined) => {
  const own = sections.filter((section) => section.classId === classId);
  return own.find((section) => section.name === sectionName) ?? own[0];
};

// new roll numbers in a section, by name, after the students already there
export const rollNumbersFor = (names: { id: string; name: string }[], alreadyThere = 0) =>
  Object.fromEntries(
    [...names]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((student, index) => [student.id, String(alreadyThere + index + 1)])
  );

export interface RunPlanRow {
  section: ISection;
  label: string;
  isFinal: boolean;
  pass: number;
  fail: number;
  noResult: number;
  promoteTo?: ISection;
  repeatIn?: ISection;
  // students whose destination is missing stay where they are; this says why
  note?: string;
}

interface PlanInput {
  sourceClasses: IClass[];
  sourceSections: ISection[];
  targetClasses: IClass[];
  targetSections: ISection[];
  stats: Map<string, { waiting: number; pass: number; fail: number; noResult: number }>;
}

// what a whole-school run does, section by section, from each section's results
export const planSchoolRun = ({ sourceClasses, sourceSections, targetClasses, targetSections, stats }: PlanInput) => {
  const ordered = inSchoolOrder(sourceClasses);
  // seats already promised to earlier sections in this run, per destination
  const planned = new Map<string, number>();
  const nameOf = (target: ISection) =>
    `${targetClasses.find((klass) => klass.id === target.classId)?.name ?? ""} · ${target.name}`;
  const hasRoom = (target: ISection, count: number) =>
    !target.capacity || (target.studentCount ?? 0) + (planned.get(target.id) ?? 0) + count <= target.capacity;
  const reserve = (target: ISection, count: number) => planned.set(target.id, (planned.get(target.id) ?? 0) + count);

  return ordered.flatMap((klass, index) => {
    const isFinal = index === ordered.length - 1;
    const promoteClass = isFinal ? undefined : classAfter(sourceClasses, targetClasses, klass, 1);
    const repeatClass = classAfter(sourceClasses, targetClasses, klass, 0);
    return sourceSections
      .filter((section) => section.classId === klass.id)
      .sort((a, b) => a.name.localeCompare(b.name))
      .flatMap((section): RunPlanRow[] => {
        const row = stats.get(section.id);
        if (!row?.waiting || !(row.pass + row.fail)) return [];
        const notes: string[] = [];
        // a lane lands only where its section exists and has room for all of it; otherwise it stays for the board
        const place = (target: ISection | undefined, count: number, missingName: string) => {
          if (!count) return target;
          if (!target) notes.push(`No ${missingName} section next year`);
          else if (!hasRoom(target, count)) notes.push(`${nameOf(target)} has no room for ${count} more`);
          else {
            reserve(target, count);
            return target;
          }
          return undefined;
        };
        const promoteTo = isFinal
          ? undefined
          : place(
              sectionIn(targetSections, promoteClass?.id, section.name),
              row.pass,
              ordered[index + 1]?.name ?? "next class"
            );
        const repeatIn = place(sectionIn(targetSections, repeatClass?.id, section.name), row.fail, klass.name);
        return [
          {
            section,
            label: `${klass.name} · ${section.name}`,
            isFinal,
            pass: row.pass,
            fail: row.fail,
            noResult: row.noResult,
            promoteTo,
            repeatIn,
            note: notes.length ? notes.join("; ") : undefined,
          },
        ];
      });
  });
};
