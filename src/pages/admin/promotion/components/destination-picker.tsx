import CustomSelectDropdown from "@/shared/ui/custom-select";
import { cn } from "@/shared/lib/utils";
import { IClass, ISection } from "@/entities/academics";

interface DestinationPickerProps {
  label: string;
  classes: IClass[];
  sections: ISection[];
  classId?: string;
  sectionId?: string;
  seats: { taken: number; capacity?: number; full: boolean };
  onClass: (id: string) => void;
  onSection: (id: string) => void;
}

const option = (item?: { id: string; name: string }) => (item ? { id: item.id, name: item.name } : null);

// where a lane's students land next year, and how full that section gets
const DestinationPicker = ({
  label,
  classes,
  sections,
  classId,
  sectionId,
  seats,
  onClass,
  onSection,
}: DestinationPickerProps) => {
  const own = sections.filter((section) => section.classId === classId);
  const share = seats.capacity ? Math.min(100, Math.round((seats.taken / seats.capacity) * 100)) : 0;
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-2">
        <CustomSelectDropdown
          id={`${label}-class`}
          placeholder="Class"
          options={classes.map((klass) => ({ id: klass.id, name: klass.name }))}
          value={option(classes.find((klass) => klass.id === classId))}
          onChange={(picked) => onClass(String(picked.id))}
          emptyText="No classes in that year yet."
        />
        <CustomSelectDropdown
          id={`${label}-section`}
          placeholder="Section"
          disabled={!classId}
          options={own.map((section) => ({ id: section.id, name: section.name }))}
          value={option(own.find((section) => section.id === sectionId))}
          onChange={(picked) => onSection(String(picked.id))}
          emptyText="No sections in that class yet."
        />
      </div>
      {sectionId && (
        <div className="space-y-1">
          <p className={cn("text-xs", seats.full ? "font-medium text-red-600" : "text-gray-500")}>
            {seats.capacity ? `${seats.taken} / ${seats.capacity} seats` : `${seats.taken} student(s) after the move`}
            {seats.full && ", over capacity"}
          </p>
          {!!seats.capacity && (
            <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
              <div
                className={cn("h-full rounded-full", seats.full ? "bg-red-500" : "bg-green-500")}
                style={{ width: `${share}%` }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DestinationPicker;
