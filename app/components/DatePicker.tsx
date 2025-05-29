import * as React from "react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { DayPicker } from "react-day-picker";
import { useNavigate, useSearchParams } from "react-router-dom";

export function DatePickerDemo({ className }: { className?: string }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 获取今天的开始时间
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: fromParam ? new Date(fromParam) : todayStart,
    to: toParam
      ? new Date(toParam)
      : fromParam
      ? new Date(fromParam)
      : todayStart,
  });

  const handleDateChange = (range?: DateRange) => {
    setDate(range);
    if (range?.from) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("from", format(range.from, "yyyy-MM-dd"));

      if (range.to && range.to.getTime() !== range.from.getTime()) {
        newParams.set("to", format(range.to, "yyyy-MM-dd"));
      } else {
        newParams.delete("to");
      }

      navigate(`/?${newParams.toString()}`);
    }
  };

  return (
    <div className={`grid gap-2 ${className || ""}`}>
      <DayPicker
        mode="range"
        defaultMonth={date?.from}
        selected={date}
        onSelect={handleDateChange}
        numberOfMonths={2}
        className="border rounded-md bg-white p-3"
      />
    </div>
  );
}
