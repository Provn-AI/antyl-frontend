"use client";

import { useState, useRef, useEffect } from "react";

// ─────────────────────────────────────────────
// FE-012 · TechStackSelect
//
// Usage:
//   <TechStackSelect
//     value={profile.techStack}
//     onChange={(stack) => updateProfile({ techStack: stack })}
//   />
// ─────────────────────────────────────────────

export const TECH_OPTIONS = [
  // Languages
  "JavaScript", "TypeScript", "Python", "Go", "Rust", "Java", "Kotlin",
  "Swift", "C", "C++", "C#", "Ruby", "PHP", "Scala", "Elixir", "Dart",
  // Frontend
  "React", "Next.js", "Vue", "Nuxt", "Angular", "Svelte", "Astro",
  "Tailwind CSS", "CSS", "HTML", "Three.js", "WebGL",
  // Backend
  "Node.js", "Express", "Fastify", "NestJS", "Django", "FastAPI", "Flask",
  "Rails", "Spring Boot", "Laravel", "Phoenix",
  // Mobile
  "React Native", "Flutter", "SwiftUI", "Jetpack Compose", "Expo",
  // Databases
  "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Supabase",
  "Firebase", "DynamoDB", "Cassandra", "Elasticsearch",
  // Cloud / Infra
  "AWS", "GCP", "Azure", "Docker", "Kubernetes", "Terraform", "Nginx",
  "Vercel", "Netlify", "Cloudflare",
  // Tools / Other
  "GraphQL", "REST", "gRPC", "WebSockets", "Git", "GitHub Actions",
  "CI/CD", "Linux", "Bash", "Vim",
  // AI / Data
  "PyTorch", "TensorFlow", "scikit-learn", "Pandas", "NumPy",
  "LangChain", "OpenAI API", "Hugging Face",
];

const MAX_SELECTIONS = 12;

interface TechStackSelectProps {
  value?: string[];
  onChange?: (selected: string[]) => void;
  maxSelections?: number;
}

export default function TechStackSelect({
  value = [],
  onChange,
  maxSelections = MAX_SELECTIONS,
}: TechStackSelectProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = TECH_OPTIONS.filter(
    (t) =>
      t.toLowerCase().includes(query.toLowerCase()) &&
      !value.includes(t)
  ).slice(0, 30);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const add = (tech: string) => {
    if (value.length >= maxSelections) return;
    onChange?.([...value, tech]);
    setQuery("");
    inputRef.current?.focus();
  };

  const remove = (tech: string) => {
    onChange?.(value.filter((t) => t !== tech));
  };

  const atMax = value.length >= maxSelections;

  return (
    <>
      <style>{`
        .ts-wrap { position: relative; width: 100%; }

        /* ── Input box ── */
        .ts-box {
          min-height: 52px;
          border: 1.5px solid #E8E4DF;
          border-radius: 12px;
          padding: 8px 12px;
          background: #fff;
          display: flex; flex-wrap: wrap; gap: 6px; align-items: center;
          cursor: text;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .ts-box.focused {
          border-color: #FF6B4D;
          box-shadow: 0 0 0 3px rgba(255,107,77,0.10);
        }

        /* ── Tag ── */
        .ts-tag {
          display: inline-flex; align-items: center; gap: 5px;
          background: #FFF0ED; color: #FF6B4D;
          border: 1px solid #FFD5CB;
          border-radius: 50px; padding: 3px 10px 3px 10px;
          font-size: 12.5px; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
        }
        .ts-tag-remove {
          background: none; border: none; padding: 0;
          cursor: pointer; color: #FF6B4D; display: flex;
          align-items: center; line-height: 1;
          opacity: 0.7; transition: opacity 0.1s;
        }
        .ts-tag-remove:hover { opacity: 1; }

        /* ── Text input inside box ── */
        .ts-input {
          border: none; outline: none; background: transparent;
          font-size: 14px; font-weight: 500; color: #1A1A1A;
          font-family: 'DM Sans', sans-serif;
          flex: 1; min-width: 120px; padding: 2px 0;
        }
        .ts-input::placeholder { color: #B0A89E; font-weight: 400; }

        /* ── Dropdown ── */
        .ts-dropdown {
          position: absolute; top: calc(100% + 6px); left: 0; right: 0;
          background: #fff;
          border: 1.5px solid #E8E4DF;
          border-radius: 14px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.10);
          z-index: 50;
          max-height: 220px; overflow-y: auto;
          padding: 6px;
        }
        .ts-dropdown::-webkit-scrollbar { width: 4px; }
        .ts-dropdown::-webkit-scrollbar-thumb { background: #E8E4DF; border-radius: 4px; }

        .ts-option {
          padding: 9px 12px;
          border-radius: 9px;
          font-size: 13.5px; font-weight: 500; color: #1A1A1A;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: background 0.1s;
          display: flex; align-items: center; justify-content: space-between;
        }
        .ts-option:hover { background: #FFF5F2; color: #FF6B4D; }
        .ts-option.disabled { opacity: 0.4; cursor: not-allowed; }
        .ts-option.disabled:hover { background: transparent; color: #1A1A1A; }

        .ts-empty {
          padding: 14px 12px; font-size: 13px; color: #B0A89E;
          text-align: center; font-family: 'DM Sans', sans-serif;
        }

        /* ── Footer ── */
        .ts-footer {
          display: flex; justify-content: space-between;
          margin-top: 0.5rem;
          font-size: 12px; color: #B0A89E; font-family: 'DM Sans', sans-serif;
        }
        .ts-count-warn { color: #FF6B4D; font-weight: 600; }
      `}</style>

      <div className="ts-wrap" ref={wrapRef}>
        <div
          className={`ts-box${open ? " focused" : ""}`}
          onClick={() => { setOpen(true); inputRef.current?.focus(); }}
        >
          {value.map((tech) => (
            <span key={tech} className="ts-tag">
              {tech}
              <button
                type="button"
                className="ts-tag-remove"
                onClick={(e) => { e.stopPropagation(); remove(tech); }}
                aria-label={`Remove ${tech}`}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <line x1="2" y1="2" x2="8" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="8" y1="2" x2="2" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </span>
          ))}

          <input
            ref={inputRef}
            className="ts-input"
            placeholder={value.length === 0 ? "Search technologies…" : ""}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            disabled={atMax}
          />
        </div>

        {open && (
          <div className="ts-dropdown">
            {filtered.length > 0 ? (
              filtered.map((tech) => (
                <div
                  key={tech}
                  className={`ts-option${atMax ? " disabled" : ""}`}
                  onMouseDown={(e) => { e.preventDefault(); if (!atMax) add(tech); }}
                >
                  {tech}
                  {!atMax && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  )}
                </div>
              ))
            ) : (
              <div className="ts-empty">
                {query ? `No results for "${query}"` : "All matching techs selected"}
              </div>
            )}
          </div>
        )}

        <div className="ts-footer">
          <span>{value.length} selected</span>
          <span className={atMax ? "ts-count-warn" : ""}>
            {atMax ? `Max ${maxSelections} reached` : `up to ${maxSelections}`}
          </span>
        </div>
      </div>
    </>
  );
}