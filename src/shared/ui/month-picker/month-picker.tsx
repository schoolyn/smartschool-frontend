import { useState } from "react";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";

import { Button } from "@/shared/ui/kit/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/kit/popover";
import { cn } from "@/shared/lib/utils";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface MonthPickerProps {
  // "YYYY-MM"
  value: string;
  onChange: (value: string) => void;
  // latest month that can be picked, "YYYY-MM"
  max?: string;
  id?: string;
  className?: string;
}

const pad = (month: number) => String(month).padStart(2, "0");

// a year switcher over a grid of months, for screens that work a month at a time
const MonthPicker = ({ value, onChange, max, id, className }: MonthPickerProps) => {
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(() => Number(value.slice(0, 4)) || new Date().getFullYear());
  const maxYear = max ? Number(max.slice(0, 4)) : undefined;
  const label = value
    ? new Date(Number(value.slice(0, 4)), Number(value.slice(5, 7)) - 1).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })
    : "Select month";

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setYear(Number(value.slice(0, 4)) || new Date().getFullYear());
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          className={cn(
            "flex w-full items-center justify-between gap-2 rounded-md border border-gray-300 bg-white py-2 pl-3 pr-2.5 text-left text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500",
            open && "border-primary-500 ring-1 ring-primary-500",
            className
          )}
        >
          <span className="truncate">{label}</span>
          <CalendarIcon className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-3">
        <div className="mb-3 flex items-center justify-between">
          <Button variant="ghost" size="icon" aria-label="Previous year" onClick={() => setYear(year - 1)}>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-gray-900">{year}</span>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Next year"
            disabled={maxYear !== undefined && year >= maxYear}
            onClick={() => setYear(year + 1)}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {MONTHS.map((name, index) => {
            const month = `${year}-${pad(index + 1)}`;
            const isPicked = month === value;
            return (
              <button
                key={name}
                type="button"
                disabled={!!max && month > max}
                onClick={() => {
                  onChange(month);
                  setOpen(false);
                }}
                className={cn(
                  "rounded-md py-2 text-sm text-gray-900 hover:bg-gray-100 disabled:pointer-events-none disabled:text-gray-300",
                  isPicked && "bg-primary-600 text-white hover:bg-primary-600"
                )}
              >
                {name}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default MonthPicker;
