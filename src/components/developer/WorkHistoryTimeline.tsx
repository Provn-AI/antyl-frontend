"use client";

interface WorkHistory {
  company: string;
  role: string;
  duration: string;
  autoFilled: boolean;
}

interface Props {
  workHistory: WorkHistory[];
  setWorkHistory: React.Dispatch<
    React.SetStateAction<WorkHistory[]>
  >;
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
    const updated = workHistory.filter(
      (_, i) => i !== index
    );

    setWorkHistory(updated);
  };

  return (
    <div className="border rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          Work History
        </h2>

        <button
          onClick={addEntry}
          className="px-4 py-2 rounded-lg bg-black text-white text-sm"
        >
          Add Entry
        </button>
      </div>

      <div className="relative">
        {workHistory.map((job, index) => (
          <div
            key={index}
            className="relative pl-10 pb-8"
          >
            {/* Timeline Line */}
            {index !== workHistory.length - 1 && (
              <div className="absolute left-3 top-6 w-[2px] h-full bg-gray-300" />
            )}

            {/* Timeline Dot */}
            <div className="absolute left-0 top-2 w-6 h-6 rounded-full bg-blue-600" />

            <div className="border rounded-lg p-4 bg-white">
              <div className="flex justify-between items-center mb-4">
                <span className="font-medium">
                  Position #{index + 1}
                </span>

                <div className="flex gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      job.autoFilled
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {job.autoFilled
                      ? "Auto Filled"
                      : "Edited"}
                  </span>

                  <button
                    onClick={() => removeEntry(index)}
                    className="text-red-500 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <input
                value={job.company}
                placeholder="Company Name"
                onChange={(e) =>
                  updateField(
                    index,
                    "company",
                    e.target.value
                  )
                }
                className="border rounded-lg px-4 py-2 w-full mb-3"
              />

              <input
                value={job.role}
                placeholder="Role Title"
                onChange={(e) =>
                  updateField(
                    index,
                    "role",
                    e.target.value
                  )
                }
                className="border rounded-lg px-4 py-2 w-full mb-3"
              />

              <input
                value={job.duration}
                placeholder="Duration (Jan 2023 - Dec 2024)"
                onChange={(e) =>
                  updateField(
                    index,
                    "duration",
                    e.target.value
                  )
                }
                className="border rounded-lg px-4 py-2 w-full"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}