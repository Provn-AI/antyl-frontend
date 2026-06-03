"use client";

import { useState } from "react";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface WorkEntry {
  id: string;
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  autoFilled: boolean;
}

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  field: string;
  graduationYear: string;
  autoFilled: boolean;
}

export interface ParsedResumeData {
  yearsExperience: number;
  skills: string[];
  workHistory: WorkEntry[];
  education: EducationEntry[];
}

interface ResumeReviewProps {
  parsed: ParsedResumeData;
  onConfirm: (data: ParsedResumeData) => void;
}

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

export default function ResumeReview({ parsed, onConfirm }: ResumeReviewProps) {
  const [data, setData] = useState<ParsedResumeData>(parsed);

  const updateWork = (id: string, field: keyof WorkEntry, value: string | boolean) => {
    setData((prev) => ({
      ...prev,
      workHistory: prev.workHistory.map((w) =>
        w.id === id ? { ...w, [field]: value, autoFilled: false } : w
      ),
    }));
  };

  const removeWork = (id: string) => {
    setData((prev) => ({
      ...prev,
      workHistory: prev.workHistory.filter((w) => w.id !== id),
    }));
  };

  const addWork = () => {
    setData((prev) => ({
      ...prev,
      workHistory: [
        ...prev.workHistory,
        {
          id: Date.now().toString(),
          company: "",
          title: "",
          startDate: "",
          endDate: "",
          isCurrent: false,
          autoFilled: false,
        },
      ],
    }));
  };

  const updateEdu = (id: string, field: keyof EducationEntry, value: string) => {
    setData((prev) => ({
      ...prev,
      education: prev.education.map((e) =>
        e.id === id ? { ...e, [field]: value, autoFilled: false } : e
      ),
    }));
  };

  const removeEdu = (id: string) => {
    setData((prev) => ({
      ...prev,
      education: prev.education.filter((e) => e.id !== id),
    }));
  };

  const addEdu = () => {
    setData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: Date.now().toString(),
          institution: "",
          degree: "",
          field: "",
          graduationYear: "",
          autoFilled: false,
        },
      ],
    }));
  };

  const removeSkill = (skill: string) => {
    setData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

        .review-wrap {
          font-family: 'DM Sans', sans-serif;
          max-width: 680px;
          margin: 0 auto;
          padding: 0 0 48px;
        }

        .review-section {
          margin-bottom: 32px;
        }

        .review-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .review-section-title {
          font-size: 15px;
          font-weight: 700;
          color: #1A1A1A;
          letter-spacing: -0.01em;
        }

        .auto-badge {
          font-size: 11px;
          font-weight: 600;
          background: #FFF6EE;
          color: #FF6B4D;
          border: 1px solid #FFD5C8;
          padding: 3px 10px;
          border-radius: 50px;
        }

        .review-card {
          background: #fff;
          border: 1.5px solid #F0EBE3;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 12px;
          position: relative;
        }

        .review-card.auto-filled {
          border-color: #FFD5C8;
          background: #FFFAF8;
        }

        .field-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 12px;
        }

        .field-row.single {
          grid-template-columns: 1fr;
        }

        .field-group label {
          font-size: 12px;
          font-weight: 600;
          color: #B0A89E;
          display: block;
          margin-bottom: 5px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .field-group input {
          width: 100%;
          border: 1.5px solid #E8E4DF;
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          color: #1A1A1A;
          outline: none;
          transition: border-color 0.15s;
        }

        .field-group input:focus {
          border-color: #FF6B4D;
          box-shadow: 0 0 0 3px rgba(255,107,77,0.08);
        }

        .remove-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          background: #FFF0ED;
          border: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          cursor: pointer;
          color: #FF6B4D;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s;
        }

        .remove-btn:hover { background: #FFD5C8; }

        .add-btn {
          width: 100%;
          border: 1.5px dashed #E8E4DF;
          border-radius: 12px;
          padding: 12px;
          background: transparent;
          font-size: 14px;
          font-weight: 600;
          color: #B0A89E;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: border-color 0.15s, color 0.15s;
        }

        .add-btn:hover {
          border-color: #FF6B4D;
          color: #FF6B4D;
        }

        .skills-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .skill-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #FFF6EE;
          border: 1px solid #FFD5C8;
          color: #FF6B4D;
          font-size: 13px;
          font-weight: 600;
          padding: 5px 12px;
          border-radius: 50px;
        }

        .skill-chip button {
          background: none;
          border: none;
          color: #FF6B4D;
          cursor: pointer;
          font-size: 14px;
          padding: 0;
          line-height: 1;
          opacity: 0.6;
        }

        .skill-chip button:hover { opacity: 1; }

        .current-label {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #B0A89E;
          cursor: pointer;
          margin-top: 4px;
        }

        .current-label input { cursor: pointer; accent-color: #FF6B4D; }

        .confirm-btn {
          width: 100%;
          background: linear-gradient(90deg, #FF6B4D, #FFB347);
          color: #fff;
          border: none;
          padding: 15px;
          border-radius: 50px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          margin-top: 8px;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 4px 20px rgba(255,107,77,0.28);
        }

        .confirm-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(255,107,77,0.36);
        }

        .years-input {
          width: 80px;
          border: 1.5px solid #E8E4DF;
          border-radius: 10px;
          padding: 8px 12px;
          font-size: 15px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          color: #1A1A1A;
          outline: none;
          text-align: center;
        }

        .years-input:focus {
          border-color: #FF6B4D;
          box-shadow: 0 0 0 3px rgba(255,107,77,0.08);
        }

        .years-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
      `}</style>

      <div className="review-wrap">

        {/* Years of experience */}
        <div className="review-section">
          <div className="review-section-header">
            <span className="review-section-title">Years of experience</span>
            <span className="auto-badge">Auto-filled</span>
          </div>
          <div className="years-row">
            <input
              type="number"
              className="years-input"
              value={data.yearsExperience}
              min={0}
              max={50}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  yearsExperience: parseInt(e.target.value) || 0,
                }))
              }
            />
            <span style={{ fontSize: 14, color: "#B0A89E" }}>years</span>
          </div>
        </div>

        {/* Skills */}
        <div className="review-section">
          <div className="review-section-header">
            <span className="review-section-title">Skills detected</span>
            <span className="auto-badge">Auto-filled</span>
          </div>
          <div className="skills-wrap">
            {data.skills.map((skill) => (
              <span key={skill} className="skill-chip">
                {skill}
                <button onClick={() => removeSkill(skill)}>×</button>
              </span>
            ))}
          </div>
        </div>

        {/* Work history */}
        <div className="review-section">
          <div className="review-section-header">
            <span className="review-section-title">Work experience</span>
          </div>
          {data.workHistory.map((w) => (
            <div key={w.id} className={`review-card${w.autoFilled ? " auto-filled" : ""}`}>
              {w.autoFilled && (
                <span className="auto-badge" style={{ position: "absolute", top: 16, left: 20 }}>
                  Auto-filled
                </span>
              )}
              <button className="remove-btn" onClick={() => removeWork(w.id)}>×</button>
              <div style={{ marginTop: w.autoFilled ? 32 : 0 }}>
                <div className="field-row">
                  <div className="field-group">
                    <label>Company</label>
                    <input value={w.company} onChange={(e) => updateWork(w.id, "company", e.target.value)} placeholder="Company name" />
                  </div>
                  <div className="field-group">
                    <label>Job title</label>
                    <input value={w.title} onChange={(e) => updateWork(w.id, "title", e.target.value)} placeholder="Your role" />
                  </div>
                </div>
                <div className="field-row">
                  <div className="field-group">
                    <label>Start date</label>
                    <input type="month" value={w.startDate} onChange={(e) => updateWork(w.id, "startDate", e.target.value)} />
                  </div>
                  {!w.isCurrent && (
                    <div className="field-group">
                      <label>End date</label>
                      <input type="month" value={w.endDate} onChange={(e) => updateWork(w.id, "endDate", e.target.value)} />
                    </div>
                  )}
                </div>
                <label className="current-label">
                  <input type="checkbox" checked={w.isCurrent} onChange={(e) => updateWork(w.id, "isCurrent", e.target.checked)} />
                  I currently work here
                </label>
              </div>
            </div>
          ))}
          <button className="add-btn" onClick={addWork}>+ Add experience</button>
        </div>

        {/* Education */}
        <div className="review-section">
          <div className="review-section-header">
            <span className="review-section-title">Education</span>
          </div>
          {data.education.map((e) => (
            <div key={e.id} className={`review-card${e.autoFilled ? " auto-filled" : ""}`}>
              {e.autoFilled && (
                <span className="auto-badge" style={{ position: "absolute", top: 16, left: 20 }}>
                  Auto-filled
                </span>
              )}
              <button className="remove-btn" onClick={() => removeEdu(e.id)}>×</button>
              <div style={{ marginTop: e.autoFilled ? 32 : 0 }}>
                <div className="field-row single">
                  <div className="field-group">
                    <label>Institution</label>
                    <input value={e.institution} onChange={(ev) => updateEdu(e.id, "institution", ev.target.value)} placeholder="University or college" />
                  </div>
                </div>
                <div className="field-row">
                  <div className="field-group">
                    <label>Degree</label>
                    <input value={e.degree} onChange={(ev) => updateEdu(e.id, "degree", ev.target.value)} placeholder="B.Tech, MBA..." />
                  </div>
                  <div className="field-group">
                    <label>Field of study</label>
                    <input value={e.field} onChange={(ev) => updateEdu(e.id, "field", ev.target.value)} placeholder="Computer Science..." />
                  </div>
                </div>
                <div className="field-row single">
                  <div className="field-group">
                    <label>Graduation year</label>
                    <input type="number" value={e.graduationYear} onChange={(ev) => updateEdu(e.id, "graduationYear", ev.target.value)} placeholder="2022" min={1980} max={2030} />
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button className="add-btn" onClick={addEdu}>+ Add education</button>
        </div>

        <button className="confirm-btn" onClick={() => onConfirm(data)}>
          Confirm and continue →
        </button>
      </div>
    </>
  );
}