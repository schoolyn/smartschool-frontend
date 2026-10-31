import DatePicker from "@/shared/ui/date-picker";
import { Input } from "@/shared/ui/kit/input";

interface DateTimePickerProps {
  // "YYYY-MM-DDTHH:mm", or "" for none
  value: string;
  onChange: (value: string) => void;
  id?: string;
  disabled?: boolean;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

// a calendar for the day beside a box for the time
const DateTimePicker = ({ value, onChange, id, disabled, ...aria }: DateTimePickerProps) => {
  const date = value.slice(0, 10);
  const time = value.slice(11, 16);
  const join = (nextDate: string, nextTime: string) => onChange(nextDate ? `${nextDate}T${nextTime || "09:00"}` : "");

  return (
    <div className="flex gap-2">
      <DatePicker
        id={id}
        value={date}
        onChange={(next) => join(next, time)}
        disabled={disabled}
        className="min-w-0 flex-1"
        {...aria}
      />
      <Input
        type="time"
        aria-label="Time"
        value={time}
        disabled={disabled || !date}
        onChange={(event) => join(date, event.target.value)}
        className="w-28 shrink-0"
      />
    </div>
  );
};

export default DateTimePicker;
