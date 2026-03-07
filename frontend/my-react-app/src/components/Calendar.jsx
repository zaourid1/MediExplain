import { ChevronLeft, ChevronRight } from "lucide-react";
import CalendarDay from "./CalendarDay";

export default function Calendar() {

  const days = [
    { day: 1, count: 3 },
    { day: 2, count: 3 },
    { day: 3, count: 3 },
    { day: 4, count: 3 },
    { day: 5, count: 3 },
    { day: 6, count: 3 },
    { day: 7, count: 3, selected: true },

    { day: 8, count: 3 },
    { day: 9, count: 3 },
    { day: 10, count: 2 },
    { day: 11, count: 2 },
    { day: 12, count: 2 },
    { day: 13, count: 2 },
    { day: 14, count: 2 },

    { day: 15, count: 2 },
    { day: 16, count: 2 },
    { day: 17, count: 2 },
    { day: 18, count: 2 },
    { day: 19, count: 2 },
    { day: 20, count: 2 },
    { day: 21, count: 2 },

    { day: 22, count: 2 },
    { day: 23, count: 2 },
    { day: 24, count: 2 },
    { day: 25, count: 2 },
    { day: 26, count: 2 },
    { day: 27, count: 2 },
    { day: 28, count: 2 }
  ];

  const weekdays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  return (
    <div className="max-w-6xl mx-auto border rounded-2xl p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">

        <button className="p-2 rounded-lg border bg-white">
          <ChevronLeft size={20}/>
        </button>

        <h2 className="text-2xl font-semibold">
          March 2026
        </h2>

        <button className="p-2 rounded-lg border bg-white">
          <ChevronRight size={20}/>
        </button>

      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 mb-2 text-gray-500 text-sm">
        {weekdays.map(day => (
          <div key={day} className="text-center font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-4">
        {days.map((d, i) => (
          <CalendarDay
            key={i}
            day={d.day}
            count={d.count}
            selected={d.selected}
          />
        ))}
      </div>

    </div>
  );
}