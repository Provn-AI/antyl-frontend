"use client";

import { Plus, X, Sparkles, Pencil } from "lucide-react";

interface WorkHistory {
  company: string;
  role: string;
  duration: string;
  autoFilled: boolean;
}

interface Props {
  workHistory: WorkHistory[];
  setWorkHistory: React.Dispatch<React.SetStateAction<WorkHistory[]>>;
}

function FieldBadge({ autoFilled }: { autoFilled: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
        autoFilled
          ? "bg-orange-50 text-[#F2754A]"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      {autoFilled ? (
        <>
          <Sparkles className="w-3 h-3" />
          Auto-filled
        </>
      ) : (
        <>
          <Pencil className="w-3 h-3" />
          Edited
        </>
      )}
    </span>
  );
}

export default function WorkHistoryTimeline({
  workHistory,
  setWorkHistory,
}: Props) {
  const updateField = (
    index: number,
    field: keyof WorkHistory,
    value: string
  ) => {
    const updated = [...workHistory];

    updated[index] = {
      ...updated[index],
      [field]: value,
      autoFilled: false,
    };

    setWorkHistory(updated);
  };

  const addEntry = () => {
    setWorkHistory([
      ...workHistory,
      {
        company: "",
        role: "",
        duration: "",
        autoFilled: false,
      },
    ]);
  };

  const removeEntry = (index: number) => {
    const updated = workHistory.filter((_, i) => i !== index);
    setWorkHistory(updated);
  };

  return (
    <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sm:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-bold text-gray-900 text-lg">Work History</h2>

        <button
          onClick={addEntry}
          className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full text-white"
          style={{
            background: "linear-gradient(90deg, #F2754A 0%, #F8B36B 100%)",
          }}
        >
          <Plus className="w-3.5 h-3.5" />
          Add Entry
        </button>
      </div>

      {workHistory.length === 0 ? (
        <div className="text-gray-400 text-sm text-center py-6">
          No work history found. Add a position manually if needed.
        </div>
      ) : (
        <div className="relative">
          {workHistory.map((job, index) => (
            <div key={index} className="relative pl-10 pb-8">
              {/* Timeline Line */}
              {index !== workHistory.length - 1 && (
                <div className="absolute left-[11px] top-6 w-px h-full bg-gray-200" />
              )}

              {/* Timeline Dot */}
              <div className="absolute left-0 top-2 w-[22px] h-[22px] rounded-full bg-[#F2754A] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>

              <div className="border border-gray-100 rounded-2xl p-5 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-semibold text-gray-900">
                    Position #{index + 1}
                  </span>

                  <div className="flex items-center gap-3">
                    <FieldBadge autoFilled={job.autoFilled} />

                    <button
                      onClick={() => removeEntry(index)}
                      aria-label="Remove entry"
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <input
                    value={job.company}
                    placeholder="Company name"
                    onChange={(e) =>
                      updateField(index, "company", e.target.value)
                    }
                    className="w-full border border-gray-200 rounded-full px-5 py-2.5 text-sm text-gray-800 placeholder:text-gray-300 bg-white focus:outline-none focus:border-[#F2754A] transition-colors"
                  />

                  <input
                    value={job.role}
                    placeholder="Role title"
                    onChange={(e) =>
                      updateField(index, "role", e.target.value)
                    }
                    className="w-full border border-gray-200 rounded-full px-5 py-2.5 text-sm text-gray-800 placeholder:text-gray-300 bg-white focus:outline-none focus:border-[#F2754A] transition-colors"
                  />

                  <input
                    value={job.duration}
                    placeholder="Duration (Jan 2023 - Dec 2024)"
                    onChange={(e) =>
                      updateField(index, "duration", e.target.value)
                    }
                    className="w-full border border-gray-200 rounded-full px-5 py-2.5 text-sm text-gray-800 placeholder:text-gray-300 bg-white focus:outline-none focus:border-[#F2754A] transition-colors"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}