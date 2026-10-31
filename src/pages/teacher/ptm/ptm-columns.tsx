import { DataTableColumn } from "@/shared/ui/data-table";
import { Badge } from "@/shared/ui/kit/badge";
import { IPTMBooking, IPTMSlot } from "@/entities/ptm";

export type AgendaItem = { slot: IPTMSlot; booking: IPTMBooking | null };

export const agendaColumns: DataTableColumn<AgendaItem>[] = [
  {
    id: "time",
    header: "Time",
    cell: ({ row }) => (
      <span className="font-medium text-gray-900">{new Date(row.original.slot.startAt).toLocaleString()}</span>
    ),
  },
  {
    id: "student",
    header: "Student",
    meta: { align: "center" },
    cell: ({ row }) => {
      const { booking } = row.original;
      return booking && typeof booking.studentId === "object" ? booking.studentId.name : "-";
    },
  },
  {
    id: "status",
    header: "Status",
    meta: { align: "center" },
    cell: ({ row }) => (
      <Badge tone={row.original.booking ? "green" : "gray"}>{row.original.booking ? "Booked" : "Open"}</Badge>
    ),
  },
];
