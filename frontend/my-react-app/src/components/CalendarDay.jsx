import clsx from "clsx";

export default function CalendarDay({ day, count, selected }) {
  return (
    <div
      className={clsx(
        "h-32 rounded-xl border p-3 flex flex-col items-start",
        selected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 bg-white"
      )}
    >
      <span className={clsx(
        "text-sm font-medium",
        selected && "text-blue-600"
      )}>
        {day}
      </span>

      {count && (
        <span className="mt-2 text-xs bg-green-200 text-green-800 rounded-full px-2 py-0.5">
          {count}
        </span>
      )}
    </div>
  );
}