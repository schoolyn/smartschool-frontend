import { CheckCircleIcon } from "@heroicons/react/20/solid";

import { AttendanceStatus } from "@/entities/attendance";

interface RegisterStatusProps {
  counts: Record<AttendanceStatus, number> & { total: number };
  isDirty: boolean;
  isMarked: boolean;
}

// the register's live tally, and whether what's on screen is saved
const RegisterStatus = ({ counts, isDirty, isMarked }: RegisterStatusProps) => (
  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
    <span className="text-gray-600">
      <span className="font-medium text-gray-900">{counts.total}</span> students
    </span>
    <span className="text-green-700">{counts.present} present</span>
    <span className="text-red-600">{counts.absent} absent</span>
    {counts.late > 0 && <span className="text-amber-600">{counts.late} late</span>}
    {counts.excused > 0 && <span className="text-gray-600">{counts.excused} excused</span>}
    <span className="text-gray-300">|</span>
    {isDirty ? (
      <span className="font-medium text-amber-600">Unsaved changes</span>
    ) : isMarked ? (
      <span className="inline-flex items-center gap-1 text-green-700">
        <CheckCircleIcon className="h-4 w-4" />
        Saved
      </span>
    ) : (
      <span className="text-gray-500">Not marked yet</span>
    )}
  </div>
);

export default RegisterStatus;
