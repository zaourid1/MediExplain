import { Clock, Pill } from "lucide-react";

export default function ScheduleCard({ time, medicines }) {
  return (
    <div className="border border-blue-400 rounded-xl p-5 bg-white">
      
      {/* Time */}
      <div className="flex items-center gap-3 text-xl font-semibold">
        <Clock className="text-blue-600" size={22} />
        {time}
      </div>

      {/* Medicines */}
      <div className="mt-3 space-y-2">
        {medicines.map((med, index) => (
          <div key={index} className="flex items-center gap-2 text-gray-700">
            <Pill size={18} className="text-gray-500"/>
            <span className="font-medium">{med.name}</span>
            <span className="text-gray-500">- {med.dose}</span>
          </div>
        ))}
      </div>

    </div>
  );
}