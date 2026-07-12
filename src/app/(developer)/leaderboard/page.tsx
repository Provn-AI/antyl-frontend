"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Medal,
  ChevronDown,
  Search,
  Filter,
} from "lucide-react";
import {
  getLeaderboard,
  getMyRank,
  getLeaderboardFields,
  LeaderboardEntry,
  MyRank,
} from "@/services/leaderboard.service";
import { getMyBadges, Badge, BadgeCatalogEntry } from "@/services/badge.service";
import DeveloperNavbar from "../components/DeveloperNavbar";
import WeekTimer from "../components/WeekTimer";
import { BadgeIcon } from "../components/BadgeIcon";

// ─────────────────────────────────────────────
// Rank movement badge
// ─────────────────────────────────────────────

function MovementBadge({
  rank,
  previousRank,
}: {
  rank: number;
  previousRank: number | null;
}) {
  if (previousRank == null) {
    return (
      <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wide">
        New
      </span>
    );
  }

  const delta = previousRank - rank; // positive = moved up

  if (delta === 0) {
    return (
      <span className="flex items-center gap-0.5 text-[11px] font-semibold text-gray-300">
        <Minus className="w-3 h-3" />
      </span>
    );
  }

  if (delta > 0) {
    return (
      <span className="flex items-center gap-0.5 text-[11px] font-bold text-emerald-500">
        <TrendingUp className="w-3.5 h-3.5" />
        {delta}
      </span>
    );
  }

  return (
    <span className="flex items-center gap-0.5 text-[11px] font-bold text-red-400">
      <TrendingDown className="w-3.5 h-3.5" />
      {Math.abs(delta)}
    </span>
  );
}

// ─────────────────────────────────────────────
// Rank badge — medal for top 3, plain number otherwise
// ─────────────────────────────────────────────

const MEDAL_STYLES: Record<number, string> = {
  1: "bg-gradient-to-br from-[#FFD37A] to-[#F2754A] text-white",
  2: "bg-gradient-to-br from-gray-200 to-gray-400 text-white",
  3: "bg-gradient-to-br from-[#E3B27B] to-[#B5763F] text-white",
};

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    return (
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${MEDAL_STYLES[rank]}`}
      >
        <Medal className="w-4 h-4" />
      </div>
    );
  }

  return (
    <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
      <span className="text-xs font-bold text-gray-400">{rank}</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// Field selector — searchable dropdown, replaces horizontal-scroll tabs
// ─────────────────────────────────────────────

function FieldSelector({
  fields,
  selectedField,
  onSelect,
}: {
  fields: Record<string, string>;
  selectedField: string | null;
  onSelect: (field: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fieldList = Object.entries(fields);
  const filtered = fieldList.filter(([, label]) =>
    label.toLowerCase().includes(query.toLowerCase())
  );

  const currentLabel = selectedField
    ? fields[selectedField] ?? selectedField
    : "Select a field";

  return (
    <div className="relative mb-4" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between gap-3 w-full sm:w-72 px-4 py-2.5 rounded-2xl bg-white border border-gray-100 text-sm font-bold text-gray-800 hover:bg-gray-50 transition-colors"
      >
        <span className="flex items-center gap-2 min-w-0">
          <Filter className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="truncate">{currentLabel}</span>
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-full sm:w-80 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
          <div className="p-2 border-b border-gray-50">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50">
              <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search fields..."
                className="bg-transparent outline-none text-sm w-full text-gray-700 placeholder:text-gray-300"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">
                No fields match &ldquo;{query}&rdquo;
              </p>
            ) : (
              filtered.map(([key, label]) => {
                const active = selectedField === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      onSelect(key);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors ${
                      active
                        ? "bg-orange-50 text-[#F2754A]"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {label}
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

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

export default function LeaderboardPage() {
  const [fields, setFields] = useState<Record<string, string>>({});
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<MyRank | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [badgeCatalog, setBadgeCatalog] = useState<Record<string, BadgeCatalogEntry>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Single effect: load fields + own rank + badges + the initial (own-field)
  // entries together in one pass — no effect watching selectedField, so
  // there's no effect-triggers-effect chain / cascading renders.
  useEffect(() => {
    async function loadInitial() {
      setLoading(true);
      setError("");
      try {
        const [fieldsData, rank, badgeData] = await Promise.all([
          getLeaderboardFields(),
          getMyRank(),
          getMyBadges(),
        ]);
        setFields(fieldsData);
        setMyRank(rank);
        setBadges(badgeData.badges);
        setBadgeCatalog(badgeData.catalog);

        const initialField = rank?.field_of_work ?? null;
        const data = await getLeaderboard(initialField ?? undefined);
        setSelectedField(initialField ?? data.field);
        setEntries(data.entries);
      } catch {
        setError("Couldn't load the leaderboard. Please refresh.");
      } finally {
        setLoading(false);
      }
    }
    loadInitial();
  }, []);

  // Triggered directly by the dropdown selection, not by an effect
  // watching selectedField.
  const handleSelectField = useCallback(async (field: string) => {
    setSelectedField(field);
    setLoading(true);
    setError("");
    try {
      const data = await getLeaderboard(field);
      setEntries(data.entries);
    } catch {
      setError("Couldn't load rankings for this field. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex">
      <DeveloperNavbar />

      <main className="flex-1 px-4 md:px-8 py-6 md:py-10 max-w-3xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-1 flex-wrap">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-[#F2754A]" />
            <h1
              className="text-2xl font-bold text-gray-900"
              style={{ fontFamily: "var(--font-fraunces, serif)" }}
            >
              Leaderboard
            </h1>
          </div>
          <WeekTimer />
        </div>
        <p className="text-sm text-gray-400 mb-6">
          Ranked by Antyl Score within each field. Recalculated daily, movement resets weekly.
        </p>

        {/* Your rank card */}
        {myRank && myRank.rank && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <RankBadge rank={myRank.rank} />
                <div>
                  <p className="text-sm font-bold text-gray-900">Your rank</p>
                  <p className="text-xs text-gray-400">{myRank.field_label}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {myRank.score}
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                    Score
                  </p>
                </div>
                <MovementBadge
                  rank={myRank.rank}
                  previousRank={myRank.previous_rank ?? null}
                />
              </div>
            </div>

            {badges.length > 0 && (
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                {badges.slice(0, 6).map((b, i) => {
                  const meta = badgeCatalog[b.badge_key];
                  if (!meta) return null;
                  return (
                    <div
                      key={i}
                      title={meta.label}
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${meta.color}, #FFB347)` }}
                    >
                      <BadgeIcon icon={meta.icon} className="w-4 h-4 text-white" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {myRank && !myRank.rank && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-5">
            <p className="text-sm font-semibold text-gray-700">
              You are not ranked yet
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Complete a verification to get an Antyl Score and appear on the
              leaderboard.
            </p>
          </div>
        )}

        {/* Field selector — searchable dropdown instead of scrolling tabs */}
        <FieldSelector
          fields={fields}
          selectedField={selectedField}
          onSelect={handleSelectField}
        />

        {/* Rankings list */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-6 h-6 border-2 border-gray-200 border-t-[#F2754A] rounded-full animate-spin mx-auto" />
            </div>
          ) : error ? (
            <div className="py-16 text-center px-6">
              <p className="text-sm font-semibold text-gray-700">
                Something went wrong
              </p>
              <p className="text-xs text-gray-400 mt-1">{error}</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="py-16 text-center px-6">
              <Trophy className="w-6 h-6 text-gray-200 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700">
                No rankings yet
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Be the first to get verified in this field.
              </p>
            </div>
          ) : (
            entries.map((entry) => {
              const isMe = myRank?.user_id === entry.user_id;
              return (
                <div
                  key={entry.user_id}
                  className={`flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 last:border-0 ${
                    isMe ? "bg-orange-50/50" : ""
                  }`}
                >
                  <RankBadge rank={entry.rank} />

                  <div className="w-9 h-9 rounded-full bg-gray-50 flex-shrink-0 overflow-hidden">
                    {entry.developer_profiles.avatar_url ? (
                      <img
                        src={entry.developer_profiles.avatar_url}
                        alt={entry.developer_profiles.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-300">
                        {entry.developer_profiles.name?.[0] ?? "?"}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {entry.developer_profiles.name}
                      {isMe && (
                        <span className="ml-1.5 text-[10px] font-bold text-[#F2754A]">
                          You
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {entry.developer_profiles.current_role}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-gray-900">
                      {entry.score}
                    </p>
                  </div>

                  <div className="w-10 flex-shrink-0 flex justify-end">
                    <MovementBadge
                      rank={entry.rank}
                      previousRank={entry.previous_rank}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}