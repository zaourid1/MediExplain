import MedicineCard from "./MedicineCard";
import MedicineSchedule from "./MedicineSchedule";

export default function Dashboard({ prescriptionData, onBack }) {
  const language = prescriptionData?.language ?? "English";
  const medicines = prescriptionData?.medicines ?? [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation */}
      <header className="w-full border-b bg-white/80 backdrop-blur">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              Rx
            </span>
            <span className="font-semibold text-lg text-slate-900">
              My Prescriptions
            </span>
          </div>
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="px-3 py-1.5 rounded-full border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                New Upload
              </button>
            )}
            <button className="px-3 py-1.5 rounded-full border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-100">
              Profile
            </button>
            <button className="px-3 py-1.5 rounded-full bg-slate-900 text-xs font-medium text-white hover:bg-slate-800">
              Log Out
            </button>
          </div>
        </div>

        {/* Secondary nav */}
        <div className="border-t bg-white">
          <div className="max-w-6xl mx-auto px-4 py-2 flex flex-wrap gap-2 text-xs sm:text-sm">
            <button className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 font-medium">
              My Medicines
            </button>
            <button className="px-3 py-1.5 rounded-full text-slate-600 hover:bg-slate-100">
              Calendar
            </button>
            <button className="px-3 py-1.5 rounded-full text-slate-600 hover:bg-slate-100">
              My Uploads
            </button>
            <button className="px-3 py-1.5 rounded-full text-slate-600 hover:bg-slate-100">
              What to Expect
            </button>
            <button className="px-3 py-1.5 rounded-full text-slate-600 hover:bg-slate-100">
              Health Chat
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
          {/* Language selector */}
          <section className="bg-white border rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-slate-900">
                Choose Language:
              </span>
              <select
                className="border border-slate-300 rounded-md px-2 py-1 text-sm bg-white text-slate-800"
                value={language}
                readOnly
              >
                <option>{language}</option>
              </select>
            </div>
            <p className="text-xs text-slate-500">
              Your prescription will be explained in the selected language.
            </p>
          </section>

          {/* Medicine cards */}
          <section className="space-y-6">
            {medicines.map((medicine) => (
              <MedicineCard key={medicine.id ?? medicine.name} medicine={medicine} />
            ))}
          </section>

          {/* Daily schedule */}
          <section>
            <MedicineSchedule />
          </section>
        </div>
      </main>
    </div>
  );
}