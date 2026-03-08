import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { LogOut } from "lucide-react";
import { Routes, Route } from "react-router-dom";
import MedicineCard from "../components/MedicineCard";
import MedicineSchedule from "../components/MedicineSchedule";
import Navbar from "../components/Navbar";
import UploadPrescription from "../components/UploadPrescription";

export default function Dashboard() {
  const [language, setLanguage] = useState("en");
  const { user, logout } = useAuth0();

  return (
    <>
      <header className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between border-b bg-white/80">
        <span className="text-sm text-slate-600">
          Welcome, {user?.name || user?.email || "User"}
        </span>
        <button
          onClick={() =>
            logout({ logoutParams: { returnTo: window.location.origin } })
          }
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          <LogOut size={16} />
          Log Out
        </button>
      </header>
      <div className="pt-8"></div>
      <Navbar />
      <div className="pt-8"></div>

      <Routes>
        <Route index element={<MedicineCard language={language} />} />
        <Route path="medicines" element={<MedicineCard language={language} />} />
        <Route path="calendar" element={<MedicineSchedule />} />
        <Route path="uploads" element={<UploadPrescription />} />
      </Routes>
      <div className="pt-8"></div>
    </>
  );
}