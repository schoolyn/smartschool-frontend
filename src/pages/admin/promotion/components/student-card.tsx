import { useDraggable } from "@dnd-kit/core";

import Avatar from "@/shared/ui/avatar";
import RowMenu from "@/shared/ui/row-menu";
import { cn } from "@/shared/lib/utils";
import { IPromotionCandidate } from "@/entities/promotion";
import { Lane } from "../promotion.utils";

const RESULT_TONE: Record<string, string> = {
  pass: "bg-green-100 text-green-800",
  fail: "bg-red-100 text-red-800",
  pending: "bg-gray-100 text-gray-600",
};

// the score, with "Fail" up front so a decent percentage never reads as a pass
const resultText = ({ result }: IPromotionCandidate) => {
  if (!result) return "No result";
  const score = result.percentage != null ? `${result.percentage}%` : "";
  if (result.promotionStatus === "fail") return score ? `Fail · ${score}` : "Fail";
  return score || result.promotionStatus;
};

interface CardBodyProps {
  candidate: IPromotionCandidate;
  rollNumber?: string;
  menu?: React.ReactNode;
  className?: string;
}

// the face of a student on the board: who they are, how they did, and their new roll number
export const CardBody = ({ candidate, rollNumber, menu, className }: CardBodyProps) => {
  const { student, result } = candidate;
  return (
    <div
      className={cn("flex items-center gap-2.5 rounded-lg border border-gray-200 bg-white p-2 shadow-sm", className)}
    >
      <Avatar name={student.name} src={student.photoUrl ?? undefined} size={32} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <p className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900" title={student.name}>
            {student.name}
          </p>
          {menu}
        </div>
        <div className="flex items-center gap-2">
          <p className="min-w-0 flex-1 truncate text-xs text-gray-500">
            {student.admissionNumber}
            {rollNumber && <span className="text-gray-700"> · Roll {rollNumber}</span>}
          </p>
          <span
            title={
              result ? `${result.examName}${result.grade ? `, grade ${result.grade}` : ""}` : "No published result"
            }
            className={cn(
              "shrink-0 rounded-full px-1.5 py-px text-[11px] font-medium capitalize",
              RESULT_TONE[result?.promotionStatus ?? "pending"]
            )}
          >
            {resultText(candidate)}
          </span>
        </div>
      </div>
    </div>
  );
};

interface StudentCardProps {
  candidate: IPromotionCandidate;
  rollNumber?: string;
  moveOptions: { key: Lane; title: string }[];
  onMove: (lane: Lane) => void;
}

// a card that drags between lanes; the menu does the same for anyone not using a mouse
const StudentCard = ({ candidate, rollNumber, moveOptions, onMove }: StudentCardProps) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: candidate.student.id });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      aria-label={candidate.student.name}
      className={cn(
        "cursor-grab touch-none rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
        isDragging && "opacity-30"
      )}
    >
      <CardBody
        candidate={candidate}
        rollNumber={rollNumber}
        menu={
          <RowMenu
            label={`Move ${candidate.student.name}`}
            className="h-6 w-6 shrink-0 border-0 bg-transparent shadow-none"
            items={moveOptions.map((option) => ({
              label: `Move to ${option.title}`,
              onSelect: () => onMove(option.key),
            }))}
          />
        }
      />
    </div>
  );
};

export default StudentCard;
