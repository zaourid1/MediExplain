import { Routes, Route } from "react-router-dom";
import MedicineCard from "../components/MedicineCard";
import MedicineSchedule from "../components/MedicineSchedule";
import LanguageCard from "../components/LanguageCard";
import Navbar from "../components/Navbar";
import UploadPrescription from "../components/UploadPrescription";

export default function Dashboard() {
  return (
    <>
      <div className="pt-8"></div>
      <Navbar />
      <div className="pt-8"></div>

      <Routes>
        <Route index element={<MedicineCard />} />
        <Route path="medicines" element={<MedicineCard />} />
        <Route path="calendar" element={<MedicineSchedule />} />
        <Route path="uploads" element={<UploadPrescription />} />
      </Routes>
      <div className="pt-8"></div>
    </>
  );
}