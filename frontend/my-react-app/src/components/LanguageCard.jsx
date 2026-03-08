import { Globe } from "lucide-react";

const LANGUAGES = [
  { label: "English",  code: "en" },
  { label: "Spanish",  code: "es" },
  { label: "French",   code: "fr" },
  { label: "Mandarin", code: "zh" },
  { label: "Arabic",   code: "ar" },
  { label: "Hindi",    code: "hi" },
];

export default function LanguageCard({ selectedLanguage, onLanguageChange }) {
  return (
    <div className="max-w-5xl mx-auto border border-gray-300 rounded-2xl shadow-sm bg-gray-50 p-6 flex items-center gap-6">
      <div className="flex items-center gap-3 text-lg font-medium">
        <Globe className="text-blue-600" size={24} />
        <span>Choose Language:</span>
      </div>

      <select
        value={selectedLanguage}
        onChange={(e) => onLanguageChange(e.target.value)}
        className="border border-gray-300 rounded-xl px-5 py-3 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {LANGUAGES.map(({ label, code }) => (
          <option key={code} value={code}>{label}</option>
        ))}
      </select>
    </div>
  );
}