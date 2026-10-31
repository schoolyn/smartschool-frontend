import { XMarkIcon } from "@heroicons/react/24/outline";

import { DataTableColumn } from "@/shared/ui/data-table";
import { ITimetableSlot } from "@/entities/timetable";
import { DAY_NAMES, formatTime } from "../timetable.utils";

interface WeekGridColumnProps {
  slots: ITimetableSlot[];
  days: number[];
  // the teacher's own week shows which class each period is with, instead of who teaches it
  showSection: boolean;
  onDelete?: (slot: ITimetableSlot) => void;
}

// one row per period ("HH:MM-HH:MM"), one column per school day
export const weekGridColumns = ({
  slots,
  days,
  showSection,
  onDelete,
}: WeekGridColumnProps): DataTableColumn<string>[] => [
  {
    id: "time",
    header: "Time",
    meta: { className: "w-32 border-r border-gray-200 align-top text-xs font-medium text-gray-600" },
    cell: ({ row: { original: period } }) => {
      const [start, end] = period.split("-");
      return (
        <>
          {formatTime(start)}
          <span className="block text-gray-400">{formatTime(end)}</span>
        </>
      );
    },
  },
  ...days.map((day): DataTableColumn<string> => ({
    id: String(day),
    header: DAY_NAMES[day].slice(0, 3),
    meta: { className: "min-w-[140px] p-1.5 align-top" },
    cell: ({ row: { original: period } }) => {
      const [start, end] = period.split("-");
      return slots
        .filter((slot) => slot.dayOfWeek === day && slot.startTime === start && slot.endTime === end)
        .map((slot) => (
          <div
            key={slot.id}
            className="group relative mb-1 rounded-md border border-primary-100 bg-primary-50 px-2 py-1.5"
          >
            <p className="pr-4 text-xs font-semibold text-primary-900">{slot.subjectId?.name ?? "Subject"}</p>
            <p className="text-[11px] text-gray-600">
              {showSection
                ? `${slot.classId?.name ?? ""} ${slot.sectionId?.name ?? ""}`.trim()
                : slot.teacherUserId?.name}
              {slot.room ? ` · ${slot.room}` : ""}
            </p>
            {onDelete && (
              <button
                type="button"
                aria-label={`Remove ${slot.subjectId?.name ?? "period"} on ${DAY_NAMES[slot.dayOfWeek]}`}
                onClick={() => onDelete(slot)}
                className="absolute right-1 top-1 rounded p-0.5 text-gray-400 opacity-0 hover:bg-white hover:text-red-600 focus:opacity-100 group-hover:opacity-100"
              >
                <XMarkIcon className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ));
    },
  })),
];
