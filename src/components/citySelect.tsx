"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, X, Search, MapPin } from "lucide-react";
import { CITIES } from "@/lib/cities";

interface CitySelectProps {
  mode: "single" | "multi";
  value: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

const inputCls =
  "w-full border border-gray-200 rounded-2xl px-3 py-2.5 text-sm font-semibold text-gray-800 outline-none focus:border-[#F2754A] transition-colors bg-white";

export default function CitySelect({
  mode,
  value,
  onChange,
  placeholder = "Select city",
  disabled = false,
}: CitySelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const selectedValues =
    mode === "multi" ? (value as string[]) : value ? [value as string] : [];

  const filtered = CITIES.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  function handleSelect(cityValue: string) {
    if (mode === "single") {
      onChange(cityValue);
      setOpen(false);
      setQuery("");
    } else {
      const current = value as string[];
      if (current.includes(cityValue)) {
        onChange(current.filter((v) => v !== cityValue));
      } else {
        onChange([...current, cityValue]);
      }
    }
  }

  function removeChip(cityValue: string) {
    const current = value as string[];
    onChange(current.filter((v) => v !== cityValue));
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center justify-between gap-2 ${inputCls} disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <span className="flex flex-wrap gap-1.5 flex-1 text-left min-w-0 items-center">
          {selectedValues.length === 0 ? (
            <span className="flex items-center gap-1.5 text-gray-300 font-normal">
              <MapPin className="w-3.5 h-3.5" />
              {placeholder}
            </span>
          ) : mode === "single" ? (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              {selectedValues[0]}
            </span>
          ) : (
            selectedValues.map((v) => (
              <span
                key={v}
                className="flex items-center gap-1 bg-orange-50 text-[#F2754A] text-xs font-bold px-2 py-1 rounded-full"
              >
                {v}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeChip(v);
                  }}
                />
              </span>
            ))
          )}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && !disabled && (
        <div className="absolute z-20 mt-2 w-full bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
          <div className="p-2 border-b border-gray-50">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50">
              <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search cities..."
                className="bg-transparent outline-none text-sm w-full text-gray-700 placeholder:text-gray-300"
              />
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">
                No cities match &ldquo;{query}&rdquo;
              </p>
            ) : (
              filtered.map((city) => {
                const active = selectedValues.includes(city.value);
                return (
                  <button
                    key={city.value}
                    type="button"
                    onClick={() => handleSelect(city.value)}
                    className={`w-full flex items-center justify-between text-left px-4 py-2.5 text-sm font-semibold transition-colors ${
                      active
                        ? "bg-orange-50 text-[#F2754A]"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {city.label}
                    {active && mode === "multi" && (
                      <span className="text-[10px] font-bold">✓</span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}