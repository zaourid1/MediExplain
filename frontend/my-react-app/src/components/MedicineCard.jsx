import { Volume2, Clock, AlertCircle, User } from "lucide-react";

export default function MedicineCard({ medicine }) {
  const {
    name,
    description,
    dosage,
    howOften,
    times = [],
    instructions,
    sideEffects = [],
    warnings = [],
    doctor,
    startDate,
    endDate,
  } = medicine;

  return (
    <div className="max-w-4xl mx-auto bg-white border rounded-xl shadow-sm p-6">
      {/* Header */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">{name}</h2>
          {description && <p className="text-gray-500">{description}</p>}
        </div>

        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
          <Volume2 size={18} />
          Listen
        </button>
      </div>

      {/* Dosage Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 mt-8 gap-4">
        <div>
          <p className="text-gray-500 font-medium text-sm">Dosage:</p>
          <p className="text-xl mt-1 text-slate-900">{dosage}</p>
        </div>

        <div>
          <p className="text-gray-500 font-medium text-sm">How Often:</p>
          <p className="text-xl mt-1 text-slate-900">{howOften}</p>
        </div>
      </div>

      {/* Time */}
      {times.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock size={18} />
            <span className="font-medium text-sm">When to Take:</span>
          </div>

          <div className="flex flex-wrap gap-3 mt-3">
            {times.map((time) => (
              <span
                key={time}
                className="px-4 py-2 border rounded-lg bg-gray-50 text-sm text-slate-900"
              >
                {time}
              </span>
            ))}
          </div>
        </div>
      )}

      <hr className="my-6" />

      {/* Instructions */}
      {instructions && (
        <div>
          <p className="font-medium text-gray-700">Instructions:</p>
          <p className="mt-2 text-gray-700 text-sm leading-relaxed">
            {instructions}
          </p>
        </div>
      )}

      {/* Side Effects */}
      {sideEffects.length > 0 && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-800 font-medium">
            <AlertCircle size={18} />
            Possible Side Effects:
          </div>

          <ul className="list-disc ml-6 mt-2 text-gray-700 space-y-1 text-sm">
            {sideEffects.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Important Warnings */}
      {warnings.length > 0 && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800 font-medium">
            <AlertCircle size={18} />
            Important Warnings:
          </div>

          <ul className="list-disc ml-6 mt-2 text-gray-700 space-y-1 text-sm">
            {warnings.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer */}
      <div className="flex flex-wrap items-center gap-4 mt-6 text-gray-600 text-xs sm:text-sm">
        {doctor && (
          <div className="flex items-center gap-2">
            <User size={18} />
            <span>Prescribed by: {doctor}</span>
          </div>
        )}
        {(startDate || endDate) && (
          <div className="flex flex-wrap gap-3 ml-auto">
            {startDate && <span>Start: {startDate}</span>}
            {endDate && <span>End: {endDate}</span>}
          </div>
        )}
      </div>
    </div>
  );
}