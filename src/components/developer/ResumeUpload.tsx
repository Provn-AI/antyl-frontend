"use client";

import { useRef, useState } from "react";

interface ResumeUploadProps {
  onFileSelect: (file: File) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function ResumeUpload({
  onFileSelect,
}: ResumeUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const validateFile = (selectedFile: File) => {
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!validTypes.includes(selectedFile.type)) {
      setError("Only PDF and DOCX files are allowed.");
      return false;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("File size must be under 5MB.");
      return false;
    }

    setError("");
    return true;
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    if (!validateFile(selectedFile)) return;

    setFile(selectedFile);
    onFileSelect(selectedFile);
  };

  return (
    <div className="border rounded-xl p-6 bg-white">
      <h3 className="text-lg font-semibold mb-2">
        Upload Resume
      </h3>

      <p className="text-sm text-gray-500 mb-4">
        PDF or DOCX • Max 5MB
      </p>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx"
        className="hidden"
        onChange={handleFileChange}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="px-4 py-2 rounded-lg bg-black text-white"
      >
        Choose File
      </button>

      {file && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg">
          <p className="font-medium">{file.name}</p>
          <p className="text-sm text-gray-500">
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      )}

      {error && (
        <p className="mt-3 text-red-500 text-sm">
          {error}
        </p>
      )}
    </div>
  );
}