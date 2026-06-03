"use client";

// ─────────────────────────────────────────────
// FE-014 · JobTypePreference
//
// Usage:
//   <JobTypePreference
//     value={profile.jobTypes}
//     onChange={(types) => updateProfile({ jobTypes: types })}
//   />
// ─────────────────────────────────────────────

export type JobType = "full_time" | "contract" | "remote" | "hybrid";

interface Option {
  value: JobType;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
}

const OPTIONS: Option[] = [
  {
    value: "full_time",
    label: "Full time",
    sublabel: "Permanent employee role",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2"/>
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
        <line x1="12" y1="12" x2="12" y2="16"/>
        <line x1="10" y1="14" x2="14" y2="14"/>
      </svg>
    ),
  },
  {
    value: "contract",
    label: "Contract",
    sublabel: "Fixed-term or freelance",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },
  {
    value: "remote",
    label: "Remote",
    sublabel: "Fully remote, anywhere",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
  },
  {
    value: "hybrid",
    label: "Hybrid",
    sublabel: "Mix of office and remote",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
];

interface JobTypePreferenceProps {
  value?: JobType[];
  onChange?: (value: JobType[]) => void;
}

export default function JobTypePreference({
  value = [],
  onChange,
}: JobTypePreferenceProps) {
  const toggle = (type: JobType) => {
    if (value.includes(type)) {
      onChange?.(value.filter((t) => t !== type));
    } else {
      onChange?.([...value, type]);
    }
  };

  return (
    <>
      <style>{`
        .jt-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.625rem;
          width: 100%;
        }

        .jt-option {
          display: flex; flex-direction: column;
          padding: 14px 14px 12px;
          border: 1.5px solid #E8E4DF;
          border-radius: 14px;
          background: #fff;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
          position: relative;
          gap: 0.625rem;
        }
        .jt-option:hover {
          border-color: #FFB347;
          background: #FFFBF8;
        }
        .jt-option.selected {
          border-color: #FF6B4D;
          background: #FFF5F2;
          box-shadow: 0 0 0 3px rgba(255,107,77,0.10);
        }

        /* ── Top row: icon + checkbox ── */
        .jt-top { display: flex; align-items: flex-start; justify-content: space-between; }

        .jt-icon-wrap {
          width: 36px; height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          background: #F5F3F0; color: #B0A89E;
          transition: background 0.15s, color 0.15s;
        }
        .jt-option.selected .jt-icon-wrap {
          background: #FFE8E3; color: #FF6B4D;
        }

        /* ── Custom checkbox ── */
        .jt-check {
          width: 18px; height: 18px; border-radius: 5px;
          border: 1.5px solid #E8E4DF;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: background 0.15s, border-color 0.15s;
        }
        .jt-option.selected .jt-check {
          background: linear-gradient(135deg, #FF6B4D, #FFB347);
          border-color: transparent;
        }
        .jt-check svg { opacity: 0; transition: opacity 0.15s; }
        .jt-option.selected .jt-check svg { opacity: 1; }

        /* ── Labels ── */
        .jt-label {
          font-size: 13.5px; font-weight: 700; color: #1A1A1A;
          letter-spacing: -0.01em; font-family: 'DM Sans', sans-serif;
        }
        .jt-sublabel {
          font-size: 11.5px; color: #B0A89E; font-weight: 400;
          font-family: 'DM Sans', sans-serif; margin-top: 1px;
        }
        .jt-option.selected .jt-sublabel { color: #C97B60; }

        /* ── Footer ── */
        .jt-footer {
          font-size: 12px; color: #B0A89E;
          font-family: 'DM Sans', sans-serif; margin-top: 0.375rem;
        }
        .jt-footer span { color: #FF6B4D; font-weight: 600; }
      `}</style>

      <div className="jt-grid" role="group" aria-label="Job type preferences">
        {OPTIONS.map((opt) => {
          const isSelected = value.includes(opt.value);
          return (
            <div
              key={opt.value}
              className={`jt-option${isSelected ? " selected" : ""}`}
              role="checkbox"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => toggle(opt.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggle(opt.value);
                }
              }}
            >
              <div className="jt-top">
                <div className="jt-icon-wrap">{opt.icon}</div>
                <div className="jt-check">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <polyline points="1.5,5 4,7.5 8.5,2.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <div>
                <div className="jt-label">{opt.label}</div>
                <div className="jt-sublabel">{opt.sublabel}</div>
              </div>
            </div>
          );
        })}
      </div>

      {value.length > 0 && (
        <p className="jt-footer">
          <span>{value.length}</span> type{value.length > 1 ? "s" : ""} selected
        </p>
      )}
    </>
  );
}