import MedicineCard from "../components/MedicineCard";
import MedicineSchedule from "../components/MedicineSchedule";
import LanguageCard from "../components/LanguageCard";

export default function Dashboard() {
  return (
    <>
    <div className="pt-8"></div>
    <LanguageCard></LanguageCard>
    <div className="pt-8"></div>
    <MedicineCard></MedicineCard>
    <div className="pt-8"></div>
    <MedicineSchedule></MedicineSchedule>
    <div className="pt-8"></div>
    </>
  );
}