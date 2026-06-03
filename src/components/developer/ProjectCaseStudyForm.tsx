"use client";

export interface ProjectCaseStudy {
  projectName: string;
  role: string;
  techUsed: string;
  problemSolved: string;
  outcome: string;
  metrics: string;
  liveUrl: string;
}

interface ProjectCaseStudyFormProps {
  value: ProjectCaseStudy;
  onChange: (value: ProjectCaseStudy) => void;
}

export default function ProjectCaseStudyForm({
  value,
  onChange,
}: ProjectCaseStudyFormProps) {
  const updateField = (
    field: keyof ProjectCaseStudy,
    fieldValue: string
  ) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  return (
    <>
      <style>{`
        .case-study-wrapper {
          display:flex;
          flex-direction:column;
          gap:14px;
          width:100%;
        }

        .case-card {
          background:#fff;
          border:1.5px solid #E8E4DF;
          border-radius:18px;
          padding:20px;
        }

        .case-title {
          font-size:18px;
          font-weight:700;
          color:#1A1A1A;
          font-family:'DM Sans',sans-serif;
          margin-bottom:6px;
        }

        .case-subtitle {
          font-size:13px;
          color:#B0A89E;
          margin-bottom:20px;
          font-family:'DM Sans',sans-serif;
        }

        .field-group {
          margin-bottom:14px;
        }

        .field-label {
          display:block;
          margin-bottom:6px;
          font-size:13px;
          font-weight:600;
          color:#1A1A1A;
          font-family:'DM Sans',sans-serif;
        }

        .field-input,
        .field-textarea {
          width:100%;
          border:1.5px solid #E8E4DF;
          border-radius:12px;
          padding:12px 14px;
          font-size:14px;
          font-family:'DM Sans',sans-serif;
          outline:none;
          transition:border-color .15s;
        }

        .field-input:focus,
        .field-textarea:focus {
          border-color:#FF6B4D;
          box-shadow:0 0 0 3px rgba(255,107,77,.10);
        }

        .field-textarea {
          resize:none;
          min-height:100px;
        }

        .hint {
          font-size:11px;
          color:#B0A89E;
          margin-top:4px;
          font-family:'DM Sans',sans-serif;
        }
      `}</style>

      <div className="case-study-wrapper">
        <div className="case-card">
          <div className="case-title">
            Project Case Study
          </div>

          <div className="case-subtitle">
            Showcase projects even if they are not on GitHub.
          </div>

          <div className="field-group">
            <label className="field-label">
              Project Name
            </label>

            <input
              className="field-input"
              value={value.projectName}
              placeholder="Customer Analytics Dashboard"
              onChange={(e) =>
                updateField(
                  "projectName",
                  e.target.value
                )
              }
            />
          </div>

          <div className="field-group">
            <label className="field-label">
              Your Role
            </label>

            <input
              className="field-input"
              value={value.role}
              placeholder="Lead Developer"
              onChange={(e) =>
                updateField(
                  "role",
                  e.target.value
                )
              }
            />
          </div>

          <div className="field-group">
            <label className="field-label">
              Technologies Used
            </label>

            <input
              className="field-input"
              value={value.techUsed}
              placeholder="React, Node.js, PostgreSQL"
              onChange={(e) =>
                updateField(
                  "techUsed",
                  e.target.value
                )
              }
            />
          </div>

          <div className="field-group">
            <label className="field-label">
              Problem Solved
            </label>

            <textarea
              className="field-textarea"
              value={value.problemSolved}
              placeholder="Describe the business or technical problem..."
              onChange={(e) =>
                updateField(
                  "problemSolved",
                  e.target.value
                )
              }
            />
          </div>

          <div className="field-group">
            <label className="field-label">
              Outcome
            </label>

            <textarea
              className="field-textarea"
              value={value.outcome}
              placeholder="Describe the outcome and impact..."
              onChange={(e) =>
                updateField(
                  "outcome",
                  e.target.value
                )
              }
            />
          </div>

          <div className="field-group">
            <label className="field-label">
              Metrics
            </label>

            <textarea
              className="field-textarea"
              value={value.metrics}
              placeholder="e.g. Reduced load time by 40%, Increased conversions by 22%"
              onChange={(e) =>
                updateField(
                  "metrics",
                  e.target.value
                )
              }
            />
          </div>

          <div className="field-group">
            <label className="field-label">
              Live URL
            </label>

            <input
              className="field-input"
              type="url"
              value={value.liveUrl}
              placeholder="https://example.com"
              onChange={(e) =>
                updateField(
                  "liveUrl",
                  e.target.value
                )
              }
            />

            <div className="hint">
              Optional if the project is private.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}