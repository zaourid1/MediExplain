import { Globe } from "lucide-react";

export default function LanguageCard() {
  return (
    <div className="max-w-5xl mx-auto border border-gray-300 rounded-2xl shadow-sm bg-gray-50 p-6 flex items-center gap-6">
      
      {/* Icon + Label */}
      <div className="flex items-center gap-3 text-lg font-medium">
        <Globe className="text-blue-600" size={24} />
        <span>Choose Language:</span>
      </div>

      {/* Dropdown */}
      <select className="border border-gray-300 rounded-xl px-5 py-3 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option>Spanish</option>
        <option>English</option>
        <option>French</option>
        <option>Chinese</option>
      </select>

    </div>
  );
}