import { DataTableColumn } from "@/shared/ui/data-table";
import { Button } from "@/shared/ui/kit/button";
import { IPTMBooking } from "@/entities/ptm";

const slotOf = (booking: IPTMBooking) => (typeof booking.slotId === "object" ? booking.slotId : null);

export const bookingColumns = (cancel: (bookingId: string) => void): DataTableColumn<IPTMBooking>[] => [
  {
    id: "student",
    header: "Student",
    cell: ({ row }) => (
      <span className="font-medium text-gray-900">
        {typeof row.original.studentId === "object" ? row.original.studentId.name : ""}
      </span>
    ),
  },
  {
    id: "time",
    header: "Time",
    meta: { align: "center" },
    cell: ({ row }) => {
      const slot = slotOf(row.original);
      return slot ? new Date(slot.startAt).toLocaleString() : "";
    },
  },
  {
    id: "join",
    header: "Join",
    meta: { align: "center" },
    cell: ({ row }) => {
      const slot = slotOf(row.original);
      return slot?.meetingLink ? (
        <a href={slot.meetingLink} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline">
          Join link
        </a>
      ) : (
        "-"
      );
    },
  },
  {
    id: "action",
    header: "Action",
    meta: { align: "center" },
    cell: ({ row }) => {
      const slot = slotOf(row.original);
      return slot && new Date(slot.startAt) > new Date() ? (
        <Button variant="link" onClick={() => cancel(row.original.id)} className="text-red-600 hover:text-red-800">
          Cancel
        </Button>
      ) : (
        <span className="text-sm text-gray-400">Past</span>
      );
    },
  },
];
