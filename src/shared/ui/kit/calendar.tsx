import { DayPicker, type DayPickerProps } from "react-day-picker";
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from "@heroicons/react/20/solid";

import { cn } from "@/shared/lib/utils";

// the one calendar for the app (shadcn style, react-day-picker v9)
const Calendar = ({ className, classNames, showOutsideDays = true, ...props }: DayPickerProps) => (
  <DayPicker
    showOutsideDays={showOutsideDays}
    className={cn("p-3", className)}
    classNames={{
      months: "relative flex flex-col gap-4",
      month: "flex w-full flex-col gap-3",
      month_caption: "flex h-8 items-center justify-center px-8",
      caption_label: "flex items-center gap-1 text-sm font-medium text-gray-900",
      dropdowns: "flex items-center gap-1.5 text-sm font-medium",
      dropdown_root:
        "relative rounded-md border border-gray-300 px-2 py-1 shadow-sm has-[:focus]:border-primary-500 has-[:focus]:ring-1 has-[:focus]:ring-primary-500",
      dropdown: "absolute inset-0 cursor-pointer opacity-0",
      nav: "absolute inset-x-0 top-0 flex items-center justify-between",
      button_previous:
        "inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30",
      button_next:
        "inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30",
      month_grid: "w-full border-collapse",
      weekdays: "flex",
      weekday: "w-9 text-center text-[0.75rem] font-normal text-gray-500",
      week: "mt-1 flex w-full",
      // colours sit on the day cell (the button inherits them), so the dark theme recolours them too
      day: "relative h-9 w-9 rounded-md p-0 text-center text-sm",
      day_button:
        "inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:pointer-events-none",
      selected: "bg-primary-600 font-medium text-white",
      today: "font-semibold ring-1 ring-inset ring-gray-300",
      outside: "text-gray-400",
      disabled: "line-through opacity-40",
      hidden: "invisible",
      ...classNames,
    }}
    components={{
      Chevron: ({ orientation }) =>
        orientation === "left" ? (
          <ChevronLeftIcon className="h-4 w-4" />
        ) : orientation === "right" ? (
          <ChevronRightIcon className="h-4 w-4" />
        ) : (
          <ChevronDownIcon className="h-4 w-4 text-gray-400" />
        ),
    }}
    {...props}
  />
);

export { Calendar };
