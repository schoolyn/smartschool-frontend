import { useState } from "react";

interface DateRange {
  from?: Date;
  to?: Date;
}

const useRangeSelectorController = () => {
  const [date, setDate] = useState<DateRange>({
    from: new Date(2025, 0, 26),
    to: new Date(2025, 1, 1),
  });

  const [currentMonth, setCurrentMonth] = useState<{
    left: Date;
    right: Date;
  }>({
    left: new Date(2025, 0),
    right: new Date(2025, 1),
  });

  const quickSelectOptions = [
    {
      label: "Today",
      getValue: () => {
        const today = new Date();
        return { from: today, to: today };
      },
    },
    {
      label: "Yesterday",
      getValue: () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return { from: yesterday, to: yesterday };
      },
    },
    {
      label: "Last 7 Days",
      getValue: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 6);
        return { from: start, to: end };
      },
    },
    {
      label: "Last 14 Days",
      getValue: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 13);
        return { from: start, to: end };
      },
    },
    {
      label: "Last Month",
      getValue: () => {
        const end = new Date();
        const start = new Date(end.getFullYear(), end.getMonth() - 1, 1);
        return { from: start, to: end };
      },
    },
    {
      label: "Last 6 Months",
      getValue: () => {
        const end = new Date();
        const start = new Date(end.getFullYear(), end.getMonth() - 6, 1);
        return { from: start, to: end };
      },
    },
    {
      label: "Last 12 Months",
      getValue: () => {
        const end = new Date();
        const start = new Date(end.getFullYear() - 1, end.getMonth(), 1);
        return { from: start, to: end };
      },
    },
  ];

  const daysInMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) =>
    new Date(year, month, 1).getDay();

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const isSameDay = (date1: Date, date2: Date) =>
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear();

  const renderCalendar = (calendarDate: Date) => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const days = [];
    const totalDays = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
    }

    // Add days of the month
    for (let day = 1; day <= totalDays; day++) {
      const currentDate = new Date(year, month, day);
      const isSelected =
        date?.from &&
        date?.to &&
        currentDate >= date.from &&
        currentDate <= date.to;
      const isRangeEnd =
        (date?.from && isSameDay(currentDate, date.from)) ||
        (date?.to && isSameDay(currentDate, date.to));

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(currentDate)}
          className={`h-8 w-8 rounded-full flex items-center justify-center
                ${isSelected ? "bg-primary-100" : "hover:bg-gray-100"}
                ${isRangeEnd ? "bg-primary-600 text-white" : ""}
              `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const handleDateClick = (selectedDate: Date) => {
    if (!date.from || (date.from && date.to)) {
      // Start new selection
      setDate({ from: selectedDate, to: undefined });
    } else {
      // Complete the selection
      if (selectedDate < date.from) {
        setDate({ from: selectedDate, to: date.from });
      } else {
        setDate({ from: date.from, to: selectedDate });
      }
    }
  };

  const handleMonthChange = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newLeft = new Date(prev.left);
      const newRight = new Date(prev.right);
      if (direction === "next") {
        newLeft.setMonth(newLeft.getMonth() + 1);
        newRight.setMonth(newRight.getMonth() + 1);
      } else {
        newLeft.setMonth(newLeft.getMonth() - 1);
        newRight.setMonth(newRight.getMonth() - 1);
      }
      return { left: newLeft, right: newRight };
    });
  };

  return {
    date,
    currentMonth,
    quickSelectOptions,
    setDate,
    handleMonthChange,
    renderCalendar,
    formatDate,
  };
};

export default useRangeSelectorController;
