import { useState } from "react";
import "./App.css";
import Dashboard from "./components/Dashboard";
import Landing from "./components/Landing";

function App() {
  const [currentView, setCurrentView] = useState("landing"); // 'landing' | 'dashboard'
  const [uploadedFile, setUploadedFile] = useState(null);
  const [prescriptionData, setPrescriptionData] = useState(null);

  const handlePrescriptionUpload = async (file) => {
    if (!file) return;

    setUploadedFile(file);

    // Placeholder for future backend integration.
    // For now, we use example data that matches the dashboard design.
    const exampleData = {
      language: "English",
      medicines: [
        {
          id: "amoxicillin",
          name: "Amoxicillin",
          description: "Pink oval pill",
          dosage: "500 mg",
          howOften: "3 times daily",
          times: ["08:00", "14:00", "20:00"],
          instructions: "Take with food. Finish all medicine even if you feel better.",
          sideEffects: ["Upset stomach", "Diarrhea", "Nausea", "Headache"],
          warnings: [
            "Tell your doctor if you are allergic to penicillin",
            "Finish all medicine",
            "Do not drink alcohol",
          ],
          doctor: "Dr. Sarah Johnson",
          startDate: "2/28/2026",
          endDate: "3/9/2026",
        },
        {
          id: "lisinopril",
          name: "Lisinopril",
          description: "Small white round pill",
          dosage: "10 mg",
          howOften: "Once daily",
          times: ["09:00"],
          instructions:
            "Take at the same time every day. For high blood pressure.",
          sideEffects: ["Dizziness", "Dry cough", "Tired feeling", "Headache"],
          warnings: [
            "Stand up slowly from sitting or lying down",
            "Do not take if pregnant",
            "Check blood pressure regularly",
          ],
          doctor: "Dr. Michael Chen",
          startDate: "1/14/2026",
          endDate: "1/14/2027",
        },
        {
          id: "metformin",
          name: "Metformin",
          description: "Large white oval pill",
          dosage: "850 mg",
          howOften: "2 times daily",
          times: ["08:00", "20:00"],
          instructions:
            "Take with meals. For diabetes. Check blood sugar regularly.",
          sideEffects: ["Upset stomach", "Bloating", "Gas", "Metallic taste"],
          warnings: [
            "Take with food",
            "Check blood sugar levels",
            "Tell your doctor if you feel very tired",
          ],
          doctor: "Dr. Sarah Johnson",
          startDate: "5/31/2025",
          endDate: "5/31/2026",
        },
      ],
    };

    setPrescriptionData(exampleData);
    setCurrentView("dashboard");
  };

  const handleBackToLanding = () => {
    setCurrentView("landing");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {currentView === "landing" ? (
        <Landing onUpload={handlePrescriptionUpload} />
      ) : (
        <Dashboard
          prescriptionData={prescriptionData}
          uploadedFile={uploadedFile}
          onBack={handleBackToLanding}
        />
      )}
    </div>
  );
}

export default App;
