import DataTable from "@/shared/ui/data-table";
import { ITimetableSlot } from "@/entities/timetable";
import { periodRows, weekDays } from "../timetable.utils";
import { weekGridColumns } from "./week-grid-columns";

interface WeekGridProps {
  slots: ITimetableSlot[];
  isLoading: boolean;
  emptyDescription: string;
  showSection?: boolean;
  onDelete?: (slot: ITimetableSlot) => void;
}

const WeekGrid = ({ slots, isLoading, emptyDescription, showSection = false, onDelete }: WeekGridProps) => (
  <DataTable
    columns={weekGridColumns({ slots, days: weekDays(slots), showSection, onDelete })}
    data={periodRows(slots)}
    getRowId={(period) => period}
    isLoading={isLoading}
    empty={{ title: "No periods yet", description: emptyDescription }}
  />
);

export default WeekGrid;
