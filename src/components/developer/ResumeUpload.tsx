"use client";

import { useRef, useState } from "react";
import { UploadCloud, FileText, X, AlertCircle } from "lucide-react";

interface ResumeUploadProps {
  onFileSelect: (file: File | null) => void;
}

const MAX_FILE_SIZE = 0.2 * 1024 * 1024; // 200kb
const VALID_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export default function ResumeUpload({ onFileSelect }: ResumeUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (selectedFile: File) => {
    if (!VALID_TYPES.includes(selectedFile.type)) {
      setError("Only PDF and DOCX files are allowed.");
      return false;
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("File size must be under 200kb.");
      return false;
    }
    setError("");
    return true;
  };

  const acceptFile = (selectedFile: File | undefined) => {
    if (!selectedFile) return;
    if (!validateFile(selectedFile)) return;

    setFile(selectedFile);
    onFileSelect(selectedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    acceptFile(e.target.files?.[0]);
    e.target.value = ""; // allow re-selecting the same file later
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    acceptFile(e.dataTransfer.files?.[0]);
  };

  const handleRemove = () => {
    setFile(null);
    setError("");
    onFileSelect(null);
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx"
        className="hidden"
        onChange={handleFileChange}
      />

      {!file ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center text-center rounded-2xl border-2 border-dashed px-6 py-12 cursor-pointer transition-colors ${
            isDragging
              ? "border-[#F2754A] bg-orange-50"
              : "border-gray-200 hover:border-gray-300 bg-gray-50"
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
            <UploadCloud className="w-5 h-5 text-[#F2754A]" />
          </div>

          <p className="font-semibold text-gray-900">
            Drag and drop your resume here
          </p>
          <p className="text-sm text-gray-400 mt-1 mb-5">
            PDF or DOCX • Max 200kb
          </p>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
            className="px-5 py-2.5 rounded-full font-semibold text-white text-sm"
            style={{
              background: "linear-gradient(90deg, #F2754A 0%, #F8B36B 100%)",
            }}
          >
            Choose File
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
              <FileText className="w-4.5 h-4.5 text-[#F2754A]" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {file.name}
              </p>
              <p className="text-sm text-gray-400">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            aria-label="Remove file"
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="mt-3 flex items-center gap-2 text-sm text-red-500">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}