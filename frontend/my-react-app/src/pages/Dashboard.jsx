import { useState } from "react";
import MedicineCard from "../components/MedicineCard";
import MedicineSchedule from "../components/MedicineSchedule";
import LanguageCard from "../components/LanguageCard";

export default function Dashboard() {
  const [language, setLanguage] = useState("en");

  return (
    <>
      <div className="pt-8"></div>
      <LanguageCard selectedLanguage={language} onLanguageChange={setLanguage} />
      <div className="pt-8"></div>
      <MedicineCard language={language} />
      <div className="pt-8"></div>
      <MedicineSchedule />
      <div className="pt-8"></div>
    </>
  );
}