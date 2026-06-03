"use client";

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  graduationYear: string;
}

interface EducationFieldsProps {
  value?: EducationItem[];
  onChange?: (items: EducationItem[]) => void;
}

export default function EducationFields({
  value = [],
  onChange,
}: EducationFieldsProps) {
  const updateItem = (
    id: string,
    field: keyof EducationItem,
    newValue: string
  ) => {
    onChange?.(
      value.map((item) =>
        item.id === id
          ? { ...item, [field]: newValue }
          : item
      )
    );
  };

  const addEducation = () => {
    onChange?.([
      ...value,
      {
        id: crypto.randomUUID(),
        degree: "",
        institution: "",
        graduationYear: "",
      },
    ]);
  };

  const removeEducation = (id: string) => {
    onChange?.(
      value.filter((item) => item.id !== id)
    );
  };

  return (
    <>
      <style>{`
        .edu-wrapper {
          display:flex;
          flex-direction:column;
          gap:1rem;
          width:100%;
        }

        .edu-card {
          background:#fff;
          border:1.5px solid #E8E4DF;
          border-radius:16px;
          padding:16px;
          transition:border-color .15s ease;
        }

        .edu-card:hover {
          border-color:#FFB347;
        }

        .edu-header {
          display:flex;
          justify-content:space-between;
          align-items:center;
          margin-bottom:14px;
        }

        .edu-title {
          display:flex;
          align-items:center;
          gap:10px;
          font-size:14px;
          font-weight:700;
          color:#1A1A1A;
          font-family:'DM Sans', sans-serif;
        }

        .edu-icon {
          width:34px;
          height:34px;
          border-radius:10px;
          background:#FFF5F2;
          color:#FF6B4D;
          display:flex;
          align-items:center;
          justify-content:center;
        }

        .field {
          width:100%;
          height:50px;
          border:1.5px solid #E8E4DF;
          border-radius:12px;
          padding:0 14px;
          margin-bottom:10px;
          font-size:14px;
          font-family:'DM Sans', sans-serif;
          outline:none;
          transition:border-color .15s;
        }

        .field:focus {
          border-color:#FF6B4D;
          box-shadow:0 0 0 3px rgba(255,107,77,0.10);
        }

        .remove-btn {
          border:none;
          background:none;
          color:#FF3B30;
          font-weight:600;
          cursor:pointer;
          font-size:13px;
        }

        .add-btn {
          border:none;
          border-radius:50px;
          padding:14px 18px;
          cursor:pointer;
          color:white;
          font-weight:700;
          font-size:14px;
          font-family:'DM Sans', sans-serif;
          background:linear-gradient(
            90deg,
            #FF6B4D,
            #FFB347
          );
          box-shadow:0 4px 20px rgba(255,107,77,0.25);
        }

        .add-btn:hover {
          transform:translateY(-1px);
        }
      `}</style>

      <div className="edu-wrapper">
        {value.map((item, index) => (
          <div
            key={item.id}
            className="edu-card"
          >
            <div className="edu-header">
              <div className="edu-title">
                <div className="edu-icon">
                  🎓
                </div>
                Education #{index + 1}
              </div>

              <button
                type="button"
                className="remove-btn"
                onClick={() =>
                  removeEducation(item.id)
                }
              >
                Remove
              </button>
            </div>

            <input
              className="field"
              placeholder="Degree (B.Tech, B.Sc, MBA)"
              value={item.degree}
              onChange={(e) =>
                updateItem(
                  item.id,
                  "degree",
                  e.target.value
                )
              }
            />

            <input
              className="field"
              placeholder="Institution"
              value={item.institution}
              onChange={(e) =>
                updateItem(
                  item.id,
                  "institution",
                  e.target.value
                )
              }
            />

            <input
              className="field"
              type="number"
              placeholder="Graduation Year"
              value={item.graduationYear}
              onChange={(e) =>
                updateItem(
                  item.id,
                  "graduationYear",
                  e.target.value
                )
              }
            />
          </div>
        ))}

        <button
          type="button"
          className="add-btn"
          onClick={addEducation}
        >
          + Add Education
        </button>
      </div>
    </>
  );
}