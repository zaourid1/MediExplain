import { useState, useRef, useCallback } from "react";
import {
  UploadCloud, FileText, CheckCircle, AlertTriangle,
  Loader2, X, Pill, Hash, Calendar, RefreshCw,
  User, Building2, ClipboardList, ChevronDown, ChevronUp,
  ShieldAlert, Scan
} from "lucide-react";
import { useAuthFetch } from "../hooks/useAuthFetch";

// ─── API call ────────────────────────────────────────────────────────────────
async function uploadAndAnalyze(file, authFetch) {
  const form = new FormData();
  form.append("file", file);

  const res = await authFetch("/api/prescriptions/analyze", {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    let err = { detail: "Unknown error" };
    try {
      err = text ? JSON.parse(text) : err;
    } catch {}
    throw new Error(err.detail || `HTTP ${res.status}`);
  }

  return res.json();
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function FieldRow({ icon: Icon, label, value, accent = false }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className="mt-0.5 p-1.5 rounded-md bg-blue-50">
        <Icon size={14} className="text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
        <p className={`text-sm font-medium break-words ${accent ? "text-blue-700" : "text-slate-800"}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function ConfidenceBadge({ confidence }) {
  const map = {
    high:   { color: "bg-emerald-100 text-emerald-700", label: "High confidence" },
    medium: { color: "bg-amber-100  text-amber-700",   label: "Medium confidence" },
    low:    { color: "bg-red-100    text-red-700",     label: "Low confidence"  },
  };
  const cfg = map[confidence] ?? map.low;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.color}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {cfg.label}
    </span>
  );
}

function RawTextBlock({ text }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-4 rounded-xl border border-slate-200 overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition text-sm font-semibold text-slate-600"
      >
        <span className="flex items-center gap-2">
          <ClipboardList size={15} />
          All extracted text
        </span>
        {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>
      {open && (
        <pre className="px-4 py-3 text-xs text-slate-600 bg-white whitespace-pre-wrap font-mono leading-relaxed max-h-64 overflow-y-auto">
          {text || "— no text detected —"}
        </pre>
      )}
    </div>
  );
}

function WarningChips({ warnings }) {
  if (!warnings?.length) return null;
  return (
    <div className="mt-4">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
        <ShieldAlert size={13} className="text-amber-500" /> Warnings
      </p>
      <div className="flex flex-wrap gap-2">
        {warnings.map((w, i) => (
          <span key={i} className="text-xs bg-amber-50 text-amber-800 border border-amber-200 rounded-full px-3 py-1 font-medium">
            {w}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Scanning animation overlay ──────────────────────────────────────────────
function ScanOverlay() {
  return (
    <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
      <div
        className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-80"
        style={{ animation: "scan 2s ease-in-out infinite", top: "0%" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-blue-500/5" />
    </div>
  );
}

// ─── States ───────────────────────────────────────────────────────────────────

function IdleDropzone({ onFile, dragging, setDragging }) {
  const inputRef = useRef(null);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  }, [onFile, setDragging]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current.click()}
      className={`
        relative flex flex-col items-center justify-center rounded-xl py-16 cursor-pointer
        border-2 border-dashed transition-all duration-200
        ${dragging
          ? "border-blue-400 bg-blue-50 scale-[1.01]"
          : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/50"
        }
      `}
    >
      <div className={`p-4 rounded-2xl mb-4 transition-all duration-200 ${dragging ? "bg-blue-100" : "bg-white shadow-sm border border-slate-100"}`}>
        <UploadCloud size={32} className={dragging ? "text-blue-500" : "text-slate-400"} />
      </div>
      <p className="font-semibold text-slate-700 text-base">
        {dragging ? "Release to upload" : "Drop your prescription here"}
      </p>
      <p className="text-slate-400 text-sm mt-1">or click to browse — JPG, PNG, WEBP</p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files[0]; if (f) onFile(f); }}
      />
    </div>
  );
}

function LoadingState({ stage, preview }) {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Image preview with scan overlay */}
      {preview && (
        <div className="relative w-full max-w-xs mx-auto rounded-xl overflow-hidden border border-slate-200 shadow-sm">
          <img src={preview} alt="Uploading" className="w-full object-cover opacity-60" />
          <ScanOverlay />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2.5 flex items-center gap-2.5 shadow-sm">
              <Loader2 size={16} className="text-blue-500 animate-spin" />
              <span className="text-sm font-semibold text-slate-700">{stage}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 text-slate-500 text-sm">
        <div className="flex gap-1.5">
          {["Uploading", "Analyzing"].map((s, i) => (
            <span
              key={s}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-500 ${
                stage === s ? "bg-blue-600 text-white" :
                stage === "Analyzing" && s === "Uploading" ? "bg-emerald-100 text-emerald-700" :
                "bg-slate-100 text-slate-400"
              }`}
            >
              {s === "Uploading" && stage === "Analyzing" ? "✓ Uploaded" : s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorState({ message, onReset }) {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="p-4 rounded-2xl bg-red-50 border border-red-100">
        <AlertTriangle size={28} className="text-red-400" />
      </div>
      <div className="text-center">
        <p className="font-semibold text-slate-800 mb-1">Analysis failed</p>
        <p className="text-sm text-slate-500 max-w-sm">{message}</p>
      </div>
      <button
        onClick={onReset}
        className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition"
      >
        <RefreshCw size={14} /> Try again
      </button>
    </div>
  );
}

function NotPrescriptionState({ analysis, onReset }) {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
        <AlertTriangle size={28} className="text-amber-400" />
      </div>
      <div className="text-center">
        <p className="font-semibold text-slate-800 mb-1">Not a prescription</p>
        <p className="text-sm text-slate-500 max-w-sm">
          {analysis.rejection_reason || "The image doesn't appear to show a prescription label."}
        </p>
        <ConfidenceBadge confidence={analysis.confidence} />
      </div>
      {analysis.raw_text && <RawTextBlock text={analysis.raw_text} />}
      <button
        onClick={onReset}
        className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition"
      >
        <RefreshCw size={14} /> Upload a different image
      </button>
    </div>
  );
}

function ResultsState({ data, onReset }) {
  const { image, analysis } = data;

  return (
    <div className="space-y-5">
      {/* Success header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-50">
            <CheckCircle size={18} className="text-emerald-500" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">Prescription detected</p>
            <ConfidenceBadge confidence={analysis.confidence} />
          </div>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-600 transition px-3 py-1.5 rounded-lg hover:bg-slate-100"
        >
          <RefreshCw size={12} /> New scan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Image preview */}
        <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50">
          <img
            src={image.url}
            alt="Prescription"
            className="w-full object-cover"
            style={{ maxHeight: 260 }}
          />
          <div className="px-3 py-2 text-xs text-slate-400 font-mono truncate border-t border-slate-100">
            {image.public_id}
          </div>
        </div>

        {/* Structured fields */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Scan size={12} /> Extracted Details
            </p>
          </div>
          <div className="px-4 divide-y divide-slate-50">
            <FieldRow icon={Pill}         label="Drug name"    value={analysis.drug_name}    accent />
            <FieldRow icon={Pill}         label="Brand name"   value={analysis.brand_name} />
            <FieldRow icon={Pill}         label="Generic"      value={analysis.generic_name} />
            <FieldRow icon={Hash}         label="Dosage"       value={analysis.dosage} />
            <FieldRow icon={FileText}     label="Form"         value={analysis.dosage_form} />
            <FieldRow icon={ClipboardList} label="Frequency"   value={analysis.frequency} />
            <FieldRow icon={Hash}         label="Quantity"     value={analysis.quantity} />
            <FieldRow icon={RefreshCw}    label="Refills"      value={analysis.refills} />
            <FieldRow icon={User}         label="Patient"      value={analysis.patient_name} />
            <FieldRow icon={User}         label="Prescriber"   value={analysis.prescriber} />
            <FieldRow icon={Building2}    label="Pharmacy"     value={analysis.pharmacy} />
            <FieldRow icon={Hash}         label="Rx Number"    value={analysis.rx_number} />
            <FieldRow icon={Calendar}     label="Fill date"    value={analysis.fill_date} />
            <FieldRow icon={Calendar}     label="Expiry"       value={analysis.expiry_date} />
          </div>
        </div>
      </div>

      <WarningChips warnings={analysis.warnings} />
      <RawTextBlock text={analysis.raw_text} />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function UploadPrescription({ onPrescriptionAnalyzed }) {
  const { authFetch } = useAuthFetch();
  const [state, setState] = useState("idle");   // idle | uploading | analyzing | success | error | not_rx
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(async (file) => {
    // Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setState("uploading");

    try {
      // Small delay so user sees "Uploading" state before it jumps
      await new Promise(r => setTimeout(r, 600));
      setState("analyzing");

      const data = await uploadAndAnalyze(file, authFetch);

      if (!data.analysis.is_prescription) {
        setResult(data);
        setState("not_rx");
      } else {
        setResult(data);
        setState("success");
        onPrescriptionAnalyzed?.(data);
      }
    } catch (err) {
      setErrorMsg(err.message);
      setState("error");
    }
  }, [authFetch, onPrescriptionAnalyzed]);

  const reset = useCallback(() => {
    setState("idle");
    setPreview(null);
    setResult(null);
    setErrorMsg("");
  }, []);

  const stage = state === "uploading" ? "Uploading" : state === "analyzing" ? "Analyzing" : "";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        @keyframes scan {
          0%   { top: -2px; opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .rx-card { font-family: 'DM Sans', sans-serif; }
      `}</style>

      <div className="rx-card max-w-2xl mx-auto">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header bar */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-600">
                <FileText size={16} className="text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-800 text-base">Prescription Scanner</h2>
                <p className="text-xs text-slate-400">Upload a label to extract medication details</p>
              </div>
            </div>
            {state !== "idle" && (
              <button onClick={reset} className="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            )}
          </div>

          {/* Body */}
          <div className="p-6">
            {state === "idle" && (
              <IdleDropzone onFile={handleFile} dragging={dragging} setDragging={setDragging} />
            )}

            {(state === "uploading" || state === "analyzing") && (
              <LoadingState stage={stage} preview={preview} />
            )}

            {state === "error" && (
              <ErrorState message={errorMsg} onReset={reset} />
            )}

            {state === "not_rx" && result && (
              <NotPrescriptionState analysis={result.analysis} onReset={reset} />
            )}

            {state === "success" && result && (
              <ResultsState data={result} onReset={reset} />
            )}
          </div>

          {/* Footer */}
          {state === "idle" && (
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
              <ShieldAlert size={12} />
              Images are processed securely and stored in your private folder.
            </div>
          )}
        </div>
      </div>
    </>
  );
}