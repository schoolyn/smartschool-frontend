import CustomSelectDropdown from "@/components/custom-select";
import { IAcademicYear } from "@/types";

// "which academic year am I looking at": every list below the Years tab is scoped to one
const YearPicker = ({
  years,
  value,
  onChange,
}: {
  years: IAcademicYear[];
  value: string;
  onChange: (yearId: string) => void;
}) => {
  const selected = years.find((year) => year.id === value);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Academic year</span>
      <CustomSelectDropdown
        className="w-44"
        placeholder="Select year"
        options={years.map((year) => ({ id: year.id, name: year.isCurrent ? `${year.name} (current)` : year.name }))}
        value={selected ? { id: selected.id, name: selected.name } : null}
        onChange={(option) => onChange(String(option.id))}
      />
    </div>
  );
};

export default YearPicker;
