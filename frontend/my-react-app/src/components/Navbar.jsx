import { Pill, Calendar, FileText } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div className="max-w-3xl mx-auto bg-gray-200 rounded-2xl p-2 flex justify-center">
      <div className="flex items-center gap-10">

        <Link
          to="/dashboard/medicines"
          className="flex hover:bg-white hover:rounded-xl hover:shadow-sm items-center gap-2 text-gray-700 px-6 py-3"
        >
          <Pill size={20} />
          <span>My Medicines</span>
        </Link>

        <Link
          to="/dashboard/calendar"
          className="flex hover:bg-white hover:rounded-xl hover:shadow-sm items-center gap-2 text-gray-700 px-6 py-3"
        >
          <Calendar size={20} />
          <span>Calendar</span>
        </Link>

        <Link
          to="/dashboard/uploads"
          className="flex hover:bg-white hover:rounded-xl hover:shadow-sm items-center gap-2 text-gray-700 px-6 py-3"
        >
          <FileText size={20} />
          <span>My Uploads</span>
        </Link>

      </div>
    </div>
  );
}