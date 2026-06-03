"use client";

// ─────────────────────────────────────────────
// FE-013 · AvailabilitySelector
//
// Usage:
//   <AvailabilitySelector
//     value={profile.availability}
//     onChange={(val) => updateProfile({ availability: val })}
//   />
// ─────────────────────────────────────────────

export type AvailabilityStatus =
  | "actively_looking"
  | "open_to_opportunities"
  | "not_looking";

interface Option {
  value: AvailabilityStatus;
  label: string;
  sublabel: string;
  dot: string;  // CSS color
}

const OPTIONS: Option[] = [
  {
    value: "actively_looking",
    label: "Actively looking",
    sublabel: "Ready for interviews now",
    dot: "#22C55E",
  },
  {
    value: "open_to_opportunities",
    label: "Open to opportunities",
    sublabel: "Not urgent, but interested",
    dot: "#FFB347",
  },
  {
    value: "not_looking",
    label: "Not looking",
    sublabel: "Hidden from recruiters",
    dot: "#B0A89E",
  },
];

interface AvailabilitySelectorProps {
  value?: AvailabilityStatus | null;
  onChange?: (value: AvailabilityStatus) => void;
}

export default function AvailabilitySelector({
  value,
  onChange,
}: AvailabilitySelectorProps) {
  return (
    <>
      <style>{`
        .avail-group { display: flex; flex-direction: column; gap: 0.625rem; width: 100%; }

        .avail-option {
          display: flex; align-items: center; gap: 0.875rem;
          padding: 13px 16px;
          border: 1.5px solid #E8E4DF;
          border-radius: 14px;
          background: #fff;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }
        .avail-option:hover { border-color: #FFB347; background: #FFFBF8; }
        .avail-option.selected {
          border-color: #FF6B4D;
          background: #FFF5F2;
          box-shadow: 0 0 0 3px rgba(255,107,77,0.10);
        }

        /* ── Status dot ── */
        .avail-dot {
          width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
        }
        .avail-option.selected .avail-dot { animation: pulse-dot 2s ease infinite; }
        @keyframes pulse-dot {
          0%, 100% { box-shadow: 0 0 0 0 currentColor; opacity: 1; }
          50% { box-shadow: 0 0 0 4px transparent; opacity: 0.7; }
        }

        /* ── Text ── */
        .avail-text { flex: 1; }
        .avail-label {
          font-size: 14px; font-weight: 700; color: #1A1A1A;
          letter-spacing: -0.01em; font-family: 'DM Sans', sans-serif;
        }
        .avail-sublabel {
          font-size: 12px; color: #B0A89E; font-weight: 400;
          font-family: 'DM Sans', sans-serif; margin-top: 1px;
        }
        .avail-option.selected .avail-sublabel { color: #C97B60; }

        /* ── Radio indicator ── */
        .avail-radio {
          width: 18px; height: 18px; border-radius: 50%;
          border: 1.5px solid #E8E4DF;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: border-color 0.15s;
        }
        .avail-option.selected .avail-radio {
          border-color: #FF6B4D;
        }
        .avail-radio-inner {
          width: 8px; height: 8px; border-radius: 50%;
          background: #FF6B4D;
          opacity: 0; transform: scale(0.4);
          transition: opacity 0.15s, transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
        }
        .avail-option.selected .avail-radio-inner {
          opacity: 1; transform: scale(1);
        }
      `}</style>

      <div className="avail-group" role="radiogroup" aria-label="Availability status">
        {OPTIONS.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <div
              key={opt.value}
              className={`avail-option${isSelected ? " selected" : ""}`}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => onChange?.(opt.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onChange?.(opt.value);
                }
              }}
            >
              <span
                className="avail-dot"
                style={{ background: opt.dot, color: opt.dot }}
              />
              <div className="avail-text">
                <div className="avail-label">{opt.label}</div>
                <div className="avail-sublabel">{opt.sublabel}</div>
              </div>
              <div className="avail-radio">
                <div className="avail-radio-inner" />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}