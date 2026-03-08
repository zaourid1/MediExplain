import { UploadCloud, FileText } from "lucide-react";
import { useRef } from "react";

export default function UploadPrescription() {
  const fileInput = useRef(null);

  const handleClick = () => {
    fileInput.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Uploaded file:", file);
      // later: send to backend
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-blue-100 border rounded-xl shadow-sm p-6">

      {/* Header */}
      <div className="flex items-center gap-3 text-2xl font-semibold mb-6">
        <FileText className="text-blue-600" size={26} />
        Upload New Prescription
      </div>

      {/* Upload Box */}
      <div
        onClick={handleClick}
        className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl py-12 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
      >
        <UploadCloud className="text-gray-500 mb-3" size={40} />
        <p className="text-gray-700 font-medium">
          Drag & drop your prescription here
        </p>
        <p className="text-gray-500 text-sm mt-1">
          or click to browse files
        </p>
      </div>

      {/* Hidden input */}
      <input
        type="file"
        accept="image/*,.pdf"
        ref={fileInput}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Footer hint */}
      <p className="text-sm text-gray-500 mt-4 text-center">
        Accepted formats: PDF, JPG, PNG
      </p>

    </div>
  );
}