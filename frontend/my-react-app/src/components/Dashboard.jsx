import MedicineCard from "./MedicineCard";
import MedicineSchedule from "./MedicineSchedule";

export default function Dashboard() {
  return (
    <>
    <div className="pt-8"></div>
    <MedicineCard></MedicineCard>
    <div className="pt-8"></div>
    <MedicineSchedule></MedicineSchedule>
    <div className="pt-8"></div>
    </>
  );
}