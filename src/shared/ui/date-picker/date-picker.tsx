import { useState } from "react";
import { CalendarIcon } from "@heroicons/react/24/outline";

import { Button } from "@/shared/ui/kit/button";
import { Calendar } from "@/shared/ui/kit/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/kit/popover";
import { cn } from "@/shared/lib/utils";
import { readable, toDate, toValue } from "./date-parts";

interface DatePickerProps {
  // "YYYY-MM-DD", or "" for none
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  // earliest and latest dates that can be picked, "YYYY-MM-DD"
  min?: string;
  max?: string;
  // filters that always need a date hide the Clear button
  clearable?: boolean;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

// a field that opens a calendar; month and year dropdowns make far-off dates (a birth date) quick to reach
const DatePicker = ({
  value,
  onChange,
  label,
  placeholder = "Select date",
  className,
  disabled,
  required,
  name,
  id,
  min,
  max,
  clearable = true,
  "aria-invalid": invalid,
  "aria-describedby": describedBy,
}: DatePickerProps) => {
  const [open, setOpen] = useState(false);
  const selected = toDate(value);
  const minDate = toDate(min);
  const maxDate = toDate(max);
  // midnight, so a `max` of today still allows today
  const today = toDate(toValue(new Date()))!;
  const todayAllowed = (!minDate || today >= minDate) && (!maxDate || today <= maxDate);

  // clicking the selected day again would clear it, which a date that is always needed must not allow
  const pick = (date?: Date) => {
    if (date || clearable) onChange(date ? toValue(date) : "");
    setOpen(false);
  };

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            id={id}
            name={name}
            disabled={disabled}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className={cn(
              "flex w-full items-center justify-between gap-2 rounded-md border border-gray-300 bg-white py-2 pl-3 pr-2.5 text-left text-sm shadow-sm",
              "focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-60",
              open && "border-primary-500 ring-1 ring-primary-500",
              invalid && "border-red-500"
            )}
          >
            <span className={cn("truncate", !value && "text-gray-400")}>{value ? readable(value) : placeholder}</span>
            <CalendarIcon className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={pick}
            captionLayout="dropdown"
            defaultMonth={selected ?? (maxDate && maxDate < today ? maxDate : today)}
            startMonth={minDate ?? new Date(today.getFullYear() - 80, 0)}
            endMonth={maxDate ?? new Date(today.getFullYear() + 10, 11)}
            disabled={[...(minDate ? [{ before: minDate }] : []), ...(maxDate ? [{ after: maxDate }] : [])]}
          />
          <div className="flex items-center justify-between border-t border-gray-100 px-3 py-2">
            {clearable ? (
              <Button variant="ghost" size="sm" onClick={() => pick(undefined)} disabled={!value}>
                Clear
              </Button>
            ) : (
              <span />
            )}
            <Button variant="ghost" size="sm" onClick={() => pick(today)} disabled={!todayAllowed}>
              Today
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DatePicker;
