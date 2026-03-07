import { Clock } from "lucide-react";
import ScheduleCard from "./ScheduleCard";

export default function MedicineSchedule() {

  const schedule = [
    {
      time: "08:00",
      medicines: [
        { name: "Amoxicillin", dose: "500 mg" },
        { name: "Metformin", dose: "800 mg" }
      ]
    },
    {
      time: "09:00",
      medicines: [
        { name: "Lisinopril", dose: "10 mg" }
      ]
    },
    {
      time: "14:00",
      medicines: [
        { name: "Amoxicillin", dose: "500 mg" }
      ]
    },
    {
      time: "20:00",
      medicines: [
        { name: "Amoxicillin", dose: "500 mg" },
        { name: "Metformin", dose: "850 mg" }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto bg-blue-100 border rounded-2xl p-6">

      {/* Header */}
      <div className="flex items-center gap-3 text-2xl font-semibold mb-6">
        <Clock className="text-blue-600" size={26} />
        Today's Medicine Schedule
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {schedule.map((item, index) => (
          <ScheduleCard
            key={index}
            time={item.time}
            medicines={item.medicines}
          />
        ))}
      </div>

    </div>
  );
}