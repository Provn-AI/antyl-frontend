"use client";

import { useState } from "react";

// ─────────────────────────────────────────────
// FE-015 · SalaryRangeInput
//
// Usage:
//   <SalaryRangeInput
//     value={profile.salary}
//     onChange={(range) => updateProfile({ salary: range })}
//   />
//
// `value` shape: { min: number; max: number; currency: "INR" | "USD" }
// ─────────────────────────────────────────────

export type Currency = "INR" | "USD";

export interface SalaryRange {
  min: number | "";
  max: number | "";
  currency: Currency;
}

interface SalaryRangeInputProps {
  value?: SalaryRange;
  onChange?: (range: SalaryRange) => void;
}

const CURRENCY_CONFIG: Record<Currency, {
  symbol: string;
  placeholder: { min: string; max: string };
  suffix: string;
}> = {
  INR: {
    symbol: "₹",
    placeholder: { min: "e.g. 10,00,000", max: "e.g. 25,00,000" },
    suffix: "/ year",
  },
  USD: {
    symbol: "$",
    placeholder: { min: "e.g. 80,000", max: "e.g. 150,000" },
    suffix: "/ year",
  },
};

// Format number with commas (Indian or International)
function formatValue(val: number | "", currency: Currency): string {
  if (val === "" || val === 0) return "";
  if (currency === "INR") {
    return val.toLocaleString("en-IN");
  }
  return val.toLocaleString("en-US");
}

// Strip non-numeric characters
function parseRaw(raw: string): number | "" {
  const stripped = raw.replace(/[^0-9]/g, "");
  if (stripped === "") return "";
  const n = parseInt(stripped, 10);
  return isNaN(n) ? "" : n;
}

export default function SalaryRangeInput({
  value = { min: "", max: "", currency: "INR" },
  onChange,
}: SalaryRangeInputProps) {
  const [focused, setFocused] = useState<"min" | "max" | null>(null);

  const { min, max, currency } = value;
  const cfg = CURRENCY_CONFIG[currency];

  const update = (patch: Partial<SalaryRange>) => {
    onChange?.({ ...value, ...patch });
  };

  // Validation
  const minNum = typeof min === "number" ? min : null;
  const maxNum = typeof max === "number" ? max : null;
  const rangeError =
    minNum !== null && maxNum !== null && minNum >= maxNum
      ? "Min must be less than max"
      : null;

  const displayMin =
    focused === "min"
      ? min === "" ? "" : String(min)
      : formatValue(min, currency);

  const displayMax =
    focused === "max"
      ? max === "" ? "" : String(max)
      : formatValue(max, currency);

  return (
    <>
      <style>{`
        .salary-wrap { display: flex; flex-direction: column; gap: 0.75rem; width: 100%; }

        /* ── Currency toggle ── */
        .currency-toggle {
          display: inline-flex; align-items: center;
          background: #F5F3F0; border-radius: 50px; padding: 3px;
          width: fit-content; gap: 2px;
        }
        .currency-btn {
          padding: 6px 18px; border-radius: 50px; border: none;
          font-size: 13px; font-weight: 700; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.15s, color 0.15s, box-shadow 0.15s;
          background: transparent; color: #B0A89E;
        }
        .currency-btn.active {
          background: #fff;
          color: #1A1A1A;
          box-shadow: 0 1px 6px rgba(0,0,0,0.08);
        }

        /* ── Range row ── */
        .salary-row {
          display: flex; align-items: center; gap: 0.625rem;
        }

        .salary-field {
          flex: 1; position: relative;
        }

        .salary-symbol {
          position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
          font-size: 14px; font-weight: 600; color: #B0A89E;
          pointer-events: none; font-family: 'DM Sans', sans-serif;
          transition: color 0.15s;
        }
        .salary-field.focused .salary-symbol { color: #FF6B4D; }

        .salary-input {
          width: 100%; height: 52px;
          border: 1.5px solid #E8E4DF;
          border-radius: 12px;
          padding: 0 12px 0 28px;
          font-size: 14px; font-weight: 600; color: #1A1A1A;
          font-family: 'DM Sans', sans-serif;
          outline: none; background: #fff;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .salary-input::placeholder { color: #B0A89E; font-weight: 400; font-size: 13px; }
        .salary-input:focus {
          border-color: #FF6B4D;
          box-shadow: 0 0 0 3px rgba(255,107,77,0.10);
        }
        .salary-input.error { border-color: #FF3B30; }
        .salary-input.error:focus { box-shadow: 0 0 0 3px rgba(255,59,48,0.08); }

        .salary-dash {
          font-size: 18px; color: #B0A89E; font-weight: 400;
          flex-shrink: 0; margin-top: 2px;
        }

        /* ── Suffix ── */
        .salary-suffix {
          font-size: 12px; color: #B0A89E; font-family: 'DM Sans', sans-serif;
          margin-top: -0.25rem;
        }

        /* ── Error ── */
        .salary-error { font-size: 12px; color: #FF3B30; font-weight: 500; }

        /* ── Preview ── */
        .salary-preview {
          font-size: 12.5px; color: #6B6560;
          font-family: 'DM Sans', sans-serif; font-weight: 500;
        }
        .salary-preview span { color: #FF6B4D; font-weight: 700; }
      `}</style>

      <div className="salary-wrap">
        {/* Currency toggle */}
        <div className="currency-toggle">
          {(["INR", "USD"] as Currency[]).map((c) => (
            <button
              key={c}
              type="button"
              className={`currency-btn${currency === c ? " active" : ""}`}
              onClick={() => update({ currency: c, min: "", max: "" })}
            >
              {c === "INR" ? "₹ INR" : "$ USD"}
            </button>
          ))}
        </div>

        {/* Min / Max inputs */}
        <div className="salary-row">
          <div className={`salary-field${focused === "min" ? " focused" : ""}`}>
            <span className="salary-symbol">{cfg.symbol}</span>
            <input
              className={`salary-input${rangeError && min !== "" ? " error" : ""}`}
              type="text"
              inputMode="numeric"
              placeholder={cfg.placeholder.min}
              value={displayMin}
              onFocus={() => setFocused("min")}
              onBlur={() => setFocused(null)}
              onChange={(e) => update({ min: parseRaw(e.target.value) })}
            />
          </div>

          <span className="salary-dash">-</span>

          <div className={`salary-field${focused === "max" ? " focused" : ""}`}>
            <span className="salary-symbol">{cfg.symbol}</span>
            <input
              className={`salary-input${rangeError && max !== "" ? " error" : ""}`}
              type="text"
              inputMode="numeric"
              placeholder={cfg.placeholder.max}
              value={displayMax}
              onFocus={() => setFocused("max")}
              onBlur={() => setFocused(null)}
              onChange={(e) => update({ max: parseRaw(e.target.value) })}
            />
          </div>
        </div>

        <p className="salary-suffix">{cfg.suffix}</p>

        {rangeError && <p className="salary-error">{rangeError}</p>}

        {/* Formatted preview */}
        {min !== "" && max !== "" && !rangeError && (
          <p className="salary-preview">
            Range:{" "}
            <span>
              {cfg.symbol}{formatValue(min, currency)} – {cfg.symbol}{formatValue(max, currency)}
            </span>
          </p>
        )}
      </div>
    </>
  );
}