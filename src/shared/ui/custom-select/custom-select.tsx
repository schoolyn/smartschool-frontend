import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../kit/select";
import { SelectDropdownProps } from "@/shared/types";

const CustomSelectDropdown = ({
  options,
  value,
  onChange,
  label,
  placeholder = "Select an option",
  className = "",
  disabled = false,
  emptyText = "Nothing to choose yet.",
  id,
  "aria-describedby": describedBy,
  "aria-invalid": invalid,
}: SelectDropdownProps) => {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <Select
        // always controlled: an empty string shows the placeholder
        value={value ? String(value.id) : ""}
        onValueChange={(id) => {
          const option = options.find((o) => String(o.id) === id);
          if (option) onChange(option);
        }}
        disabled={disabled}
      >
        <SelectTrigger className="mt-1" id={id} aria-describedby={describedBy} aria-invalid={invalid}>
          <span className="flex items-center">
            {value?.icon && <span className="mr-3 flex-shrink-0">{value.icon}</span>}
            <SelectValue placeholder={placeholder}>{value?.name || placeholder}</SelectValue>
          </span>
        </SelectTrigger>
        <SelectContent>
          {options.length === 0 && <p className="px-3 py-2.5 text-sm text-gray-500">{emptyText}</p>}
          {options.map((option) => (
            <SelectItem key={option.id} value={String(option.id)}>
              <div className="flex items-center">
                {option.icon && <span className="mr-3 flex-shrink-0">{option.icon}</span>}
                <div className="flex flex-col">
                  <span className="block truncate">{option.name}</span>
                  {option.description && (
                    <span className="block truncate text-xs text-gray-500">{option.description}</span>
                  )}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CustomSelectDropdown;
