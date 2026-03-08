import { UploadCloud, Camera, FileText, Languages, Headphones } from "lucide-react";

export default function Landing({ onUpload }) {
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file && onUpload) {
      onUpload(file);
    }
  };

  const triggerFilePicker = () => {
    const input = document.getElementById("prescription-upload-input");
    if (input) {
      input.click();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation */}
      <header className="w-full border-b bg-white/80 backdrop-blur">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              Rx
            </span>
            <span className="font-semibold text-lg text-slate-900">
              MediExplain
            </span>
          </div>
          <button className="px-4 py-2 rounded-full border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-100">
            Log In
          </button>
        </div>
      </header>

      {/* Hero + Features */}
      <main className="flex-1">
        <section className="bg-gradient-to-b from-sky-50 to-slate-50 border-b">
          <div className="max-w-6xl mx-auto px-4 py-10 grid gap-10 md:grid-cols-2 items-center">
            {/* Hero text */}
            <div>
              <p className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 border border-blue-100 mb-4">
                Clear, Simple, For Everyone.
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                Understand Your Prescriptions
              </h1>
              <p className="mt-4 text-slate-600 text-sm md:text-base max-w-md">
                Take a photo of your prescription and get easy-to-read
                instructions, side effects, and reminders in your language.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={triggerFilePicker}
                  className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                >
                  <UploadCloud className="h-4 w-4" />
                  Upload Prescription
                </button>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3 text-xs md:text-sm">
                <div className="rounded-xl bg-white shadow-sm border p-3">
                  <p className="font-semibold text-slate-900">Medicine Information</p>
                  <p className="text-slate-600 mt-1">
                    See pictures and simple explanations for each medicine.
                  </p>
                </div>
                <div className="rounded-xl bg-white shadow-sm border p-3">
                  <p className="font-semibold text-slate-900">Multiple Languages</p>
                  <p className="text-slate-600 mt-1">
                    Read instructions in your own language.
                  </p>
                </div>
                <div className="rounded-xl bg-white shadow-sm border p-3">
                  <p className="font-semibold text-slate-900">Listen Aloud</p>
                  <p className="text-slate-600 mt-1">
                    Hear your prescription read out loud.
                  </p>
                </div>
                <div className="rounded-xl bg-white shadow-sm border p-3">
                  <p className="font-semibold text-slate-900">Reminders</p>
                  <p className="text-slate-600 mt-1">
                    Get gentle reminders when it&apos;s time to take a dose.
                  </p>
                </div>
              </div>
            </div>

            {/* Hero illustration placeholder */}
            <div className="hidden md:flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-sky-200 via-blue-100 to-indigo-200 rounded-3xl blur-2xl opacity-60" />
                <div className="rounded-3xl bg-white shadow-xl border p-4">
                  <div className="h-40 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 text-sm">
                    Prescription preview
                  </div>
                  <div className="mt-4 space-y-2 text-xs">
                    <div className="font-bold text-shadow-sm">
                        Medicine Name - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
                    </div>
                    <div className="font-semibold text-shadow-sm">
                        Dosage - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
                    </div>
                    <div className="font-semibold text-shadow-sm">
                        When to Take - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
                    </div>
                    <div className="font-semibold text-shadow-sm">
                        Instructions - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Upload Section */}
        <section className="max-w-4xl mx-auto px-4 py-10 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-slate-900">
              Upload Your Prescription
            </h2>
            <p className="mt-2 text-slate-600 text-sm md:text-base">
              Take a photo or upload a picture of your prescription. We&apos;ll
              turn it into clear instructions.
            </p>
          </div>

          {/* Hidden file input used by buttons and drop area */}
          <input
            id="prescription-upload-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Drop area */}
          <div
            className="border-2 border-dashed border-slate-300 rounded-2xl bg-white px-6 py-10 flex flex-col items-center justify-center text-center hover:border-blue-400 transition-colors cursor-pointer"
            onClick={triggerFilePicker}
          >
            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
              <UploadCloud className="h-6 w-6" />
            </div>
            <p className="font-medium text-slate-900 text-sm md:text-base">
              Drop your prescription here
            </p>
            <p className="text-slate-500 text-xs md:text-sm mt-1">
              or click to select a file
            </p>
            <button
              type="button"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Choose File
            </button>
          </div>

          {/* Steps */}
          <div className="grid gap-4 mt-4 sm:grid-cols-3 text-xs md:text-sm">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <Camera className="h-4 w-4" />
              </div>
              <p className="font-semibold text-slate-900">1. Take Photo</p>
              <p className="text-slate-600">
                Use your phone or camera to take a clear picture.
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="h-9 w-9 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                <FileText className="h-4 w-4" />
              </div>
              <p className="font-semibold text-slate-900">2. Upload</p>
              <p className="text-slate-600">
                Upload the photo securely. We&apos;ll process it for you.
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="h-9 w-9 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                <Headphones className="h-4 w-4" />
              </div>
              <p className="font-semibold text-slate-900">3. Understand</p>
              <p className="text-slate-600">
                See and hear simple instructions in your language.
              </p>
            </div>
          </div>
        </section>

        {/* Small footer strip */}
        <footer className="border-t bg-white/60">
          <div className="max-w-6xl mx-auto px-4 py-4 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
            <span>© {new Date().getFullYear()} MediExplain</span>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <Languages className="h-3 w-3" /> Multiple languages
              </span>
              <span className="inline-flex items-center gap-1">
                <Headphones className="h-3 w-3" /> Listen to instructions
              </span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

