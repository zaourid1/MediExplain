import { Volume2, Clock, AlertCircle, User } from "lucide-react";

export default function MedicineCard() {
  return (
    <div className="max-w-4xl mx-auto bg-white border rounded-xl shadow-sm p-6">

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-semibold">Amoxicillin</h2>
          <p className="text-gray-500">Pink oval pill</p>
        </div>

        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Volume2 size={18} />
          Listen
        </button>
      </div>

      {/* Dosage Section */}
      <div className="grid grid-cols-2 mt-8">
        <div>
          <p className="text-gray-500 font-medium">Dosage:</p>
          <p className="text-xl mt-1">500 mg</p>
        </div>

        <div>
          <p className="text-gray-500 font-medium">How Often:</p>
          <p className="text-xl mt-1">3 times daily</p>
        </div>
      </div>

      {/* Time */}
      <div className="mt-6">
        <div className="flex items-center gap-2 text-gray-600">
          <Clock size={18} />
          <span className="font-medium">When to Take:</span>
        </div>

        <div className="flex gap-3 mt-3">
          {["08:00", "14:00", "20:00"].map((time) => (
            <span
              key={time}
              className="px-4 py-2 border rounded-lg bg-gray-50"
            >
              {time}
            </span>
          ))}
        </div>
      </div>

      <hr className="my-6" />

      {/* Instructions */}
      <div>
        <p className="font-medium text-gray-700">Instructions:</p>
        <p className="mt-2 text-gray-700">
          Take with food. Finish all medicine even if you feel better.
        </p>
      </div>

      {/* Side Effects */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-yellow-800 font-medium">
          <AlertCircle size={18} />
          Possible Side Effects:
        </div>

        <ul className="list-disc ml-6 mt-2 text-gray-700 space-y-1">
          <li>Upset stomach</li>
          <li>Diarrhea</li>
          <li>Nausea</li>
          <li>Headache</li>
        </ul>
      </div>

      {/* Important Warnings */}
      <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-800 font-medium">
            <AlertCircle size={18}/>
            Important Warnings
        </div>

        <ul className="list-disc ml-6 mt-2 text-gray-700 space-y-1">
            <li>Tell your dector if you are allergic to penicillin</li>
            <li>Finish all medicine</li>
            <li>Do not drink alcohol</li>
        </ul>
      </div>
      <div className="flex items-center gap-2 mt-6 text-gray-600">
            <User size={18} />
            <span className="text-sm">Prescribed by: Sarah Johnson</span>
        </div>
    </div>
  );
}