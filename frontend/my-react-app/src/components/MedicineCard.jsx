import { useState, useEffect } from "react";
import { Volume2, Clock, AlertCircle, User, Loader2, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import LanguageCard from "./LanguageCard";
import { useAuthFetch } from "../hooks/useAuthFetch";

// Build script for Listen from extracted prescription data
function buildListenScript(analysis) {
  const parts = [];
  const name = analysis.drug_name || analysis.brand_name || analysis.generic_name || "Your medication";
  parts.push(name);
  if (analysis.dosage_form) parts.push(analysis.dosage_form);
  if (analysis.dosage) parts.push(`Dosage: ${analysis.dosage}`);
  if (analysis.frequency) parts.push(analysis.frequency);
  if (analysis.quantity) parts.push(`Quantity: ${analysis.quantity}`);
  if (analysis.warnings?.length) {
    parts.push("Important warnings: " + analysis.warnings.join(". "));
  }
  return parts.join(". ");
}

export default function MedicineCard({ language = "en", onLanguageChange, prescription }) {
  const [isLoading, setIsLoading] = useState(false);
  const [translatedAnalysis, setTranslatedAnalysis] = useState(null);
  const [translateLoading, setTranslateLoading] = useState(false);
  const { authFetch } = useAuthFetch();

  const analysis = prescription?.analysis;

  // Translate prescription when language changes (and is not English)
  useEffect(() => {
    if (!analysis || language === "en") {
      setTranslatedAnalysis(null);
      return;
    }
    setTranslateLoading(true);
    authFetch("/api/translate/prescription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ analysis, language }),
    })
      .then((res) => res.json())
      .then((data) => setTranslatedAnalysis(data.analysis))
      .catch((err) => {
        console.error("Translation failed:", err);
        setTranslatedAnalysis(null);
      })
      .finally(() => setTranslateLoading(false));
  }, [analysis, language, authFetch]);

  const handleListen = async () => {
    if (!prescription?.analysis) return;
    setIsLoading(true);

    const dataToSpeak = displayAnalysis ?? prescription.analysis;
    const script = buildListenScript(dataToSpeak);

    try {
      const response = await fetch("/api/voice/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: script,
          language_code: language,
        }),
      });

      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(
          response.ok
            ? "Invalid response from audio service"
            : `Audio service error (${response.status}). Is the backend running?`
        );
      }

      if (!response.ok) {
        throw new Error(data.detail || `Request failed: ${response.status}`);
      }

      if (!data.audio_b64) {
        throw new Error("No audio returned. Check ElevenLabs API key in backend .env");
      }

      const audio = new Audio(`data:audio/mp3;base64,${data.audio_b64}`);
      await audio.play();
    } catch (err) {
      console.error("Audio failed:", err);
      alert(`Could not play audio: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const image = prescription?.image;
  const displayAnalysis = translatedAnalysis ?? analysis;

  // No prescription yet – prompt to upload
  if (!prescription || !analysis) {
    return (
      <>
        <div className="pt-8"></div>
        <LanguageCard selectedLanguage={language} onLanguageChange={onLanguageChange || (() => {})} />
        <div className="pt-8"></div>
        <div className="max-w-5xl mx-auto bg-white border rounded-xl shadow-sm p-12 text-center">
          <div className="p-4 rounded-2xl bg-slate-50 inline-flex mb-4">
            <Upload size={32} className="text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">No prescription loaded</p>
          <p className="text-slate-500 text-sm mt-1 mb-4">Upload a prescription in My Uploads to see your medication details here.</p>
          <Link
            to="/dashboard/uploads"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
          >
            Go to My Uploads
          </Link>
        </div>
      </>
    );
  }

  const drugName = displayAnalysis.drug_name || displayAnalysis.brand_name || displayAnalysis.generic_name || "Medication";
  const description = displayAnalysis.dosage_form || displayAnalysis.generic_name || "";
  const warnings = displayAnalysis.warnings || [];

  return (
    <>
      <div className="pt-8"></div>
      <LanguageCard selectedLanguage={language} onLanguageChange={onLanguageChange || (() => {})} />
      <div className="pt-8"></div>
      <div className="max-w-5xl mx-auto bg-white border rounded-xl shadow-sm p-6">
        {translateLoading && (
          <div className="mb-4 flex items-center gap-2 text-blue-600 text-sm">
            <Loader2 size={18} className="animate-spin" />
            Translating…
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-semibold">{drugName}</h2>
            <p className="text-gray-500">{description}</p>
          </div>

          <button
            onClick={handleListen}
            disabled={isLoading}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading
              ? <><Loader2 size={18} className="animate-spin" /> Loading...</>
              : <><Volume2 size={18} /> Listen</>
            }
          </button>
        </div>

        {/* Dosage Section */}
        <div className="grid grid-cols-2 mt-8">
          <div>
            <p className="text-gray-500 font-medium">Dosage:</p>
            <p className="text-xl mt-1">{displayAnalysis.dosage ?? analysis.dosage ?? "—"}</p>
          </div>

          <div>
            <p className="text-gray-500 font-medium">How Often:</p>
            <p className="text-xl mt-1">{displayAnalysis.frequency ?? analysis.frequency ?? "—"}</p>
          </div>
        </div>

        {/* Time / Frequency */}
        {(displayAnalysis.frequency || displayAnalysis.quantity) && (
          <div className="mt-6">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock size={18} />
              <span className="font-medium">Details:</span>
            </div>

            <div className="flex flex-wrap gap-3 mt-3">
              {displayAnalysis.quantity && (
                <span className="px-4 py-2 border rounded-lg bg-gray-50">
                  Quantity: {displayAnalysis.quantity}
                </span>
              )}
              {displayAnalysis.refills && (
                <span className="px-4 py-2 border rounded-lg bg-gray-50">
                  Refills: {displayAnalysis.refills}
                </span>
              )}
              {displayAnalysis.frequency && (
                <span className="px-4 py-2 border rounded-lg bg-gray-50">
                  {displayAnalysis.frequency}
                </span>
              )}
            </div>
          </div>
        )}

        <hr className="my-6" />

        {/* Instructions */}
        <div>
          <p className="text-gray-500 font-medium">Instructions:</p>
          <p className="mt-2 text-gray-700">
            {displayAnalysis.frequency || displayAnalysis.dosage || "Take as directed by your prescriber."}
          </p>
        </div>

        {/* Warnings (from extraction) */}
        {warnings.length > 0 && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800 font-medium">
              <AlertCircle size={18} />
              Important Warnings
            </div>

            <ul className="list-disc ml-6 mt-2 text-gray-700 space-y-1">
              {warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Prescriber */}
        {(displayAnalysis.prescriber || displayAnalysis.pharmacy) && (
          <div className="flex flex-col gap-1 mt-6 text-gray-600">
            {displayAnalysis.prescriber && (
              <div className="flex items-center gap-2">
                <User size={18} />
                <span className="text-sm">Prescribed by: {displayAnalysis.prescriber}</span>
              </div>
            )}
            {displayAnalysis.pharmacy && (
              <span className="text-sm">Pharmacy: {displayAnalysis.pharmacy}</span>
            )}
          </div>
        )}
      </div>
    </>
  );
}
