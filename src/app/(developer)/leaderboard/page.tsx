"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Crown,
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
import { ShareBadgeModal, ShareBadgeData } from "@/components/ShareBadgeModal";

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
// Rank badge — plain number pill (used for rank 4+ and your-rank card)
// ─────────────────────────────────────────────

function RankBadge({ rank }: { rank: number }) {
  return (
    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
      <span className="text-xs font-bold text-gray-400">{rank}</span>
    </div>
  );
}

function resolveBadgeRank(metadata?: Record<string, unknown>) {
  if (!metadata) return null;
  const rankValue = metadata.rank ?? metadata.position;
  return typeof rankValue === "number" ? rankValue : null;
}

function resolveBadgeFieldLabel(metadata?: Record<string, unknown>) {
  if (!metadata) return undefined;
  const fieldValue = metadata.field_label ?? metadata.field_of_work ?? metadata.field;
  return typeof fieldValue === "string" ? fieldValue : undefined;
}

// ─────────────────────────────────────────────
// Podium — top 3, displayed as 2 / 1 / 3
// ─────────────────────────────────────────────

const PODIUM_TONES: Record<
  1 | 2 | 3,
  { solid: string; gradient: string }
> = {
  1: {
    solid: "#F2754A",
    gradient: "linear-gradient(to bottom right, #FFD37A, #F2754A)",
  },
  2: {
    solid: "#9CA3AF",
    gradient: "linear-gradient(to bottom right, #E5E7EB, #9CA3AF)",
  },
  3: {
    solid: "#B5763F",
    gradient: "linear-gradient(to bottom right, #E3B27B, #B5763F)",
  },
};

function PodiumSlot({
  entry,
  place,
  isMe,
}: {
  entry: LeaderboardEntry;
  place: 1 | 2 | 3;
  isMe: boolean;
}) {
  const first = place === 1;
  const tone = PODIUM_TONES[place];
  const profile = entry.developer_profiles;

  return (
    <div
      className={`relative flex flex-col items-center min-w-0 ${
        first ? "" : "pt-8 sm:pt-12"
      }`}
    >
      <Crown
        className={first ? "w-7 h-7 sm:w-9 sm:h-9" : "w-5 h-5 sm:w-6 sm:h-6"}
        style={{ color: tone.solid }}
        fill={tone.solid}
        fillOpacity={0.9}
      />

      <div
        className={`relative mt-1.5 rounded-full overflow-hidden bg-gray-50 ${
          first ? "w-16 h-16 sm:w-24 sm:h-24" : "w-12 h-12 sm:w-[72px] sm:h-[72px]"
        }`}
      >
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-lg font-bold text-gray-300">
            {profile.name?.[0] ?? "?"}
          </div>
        )}
      </div>

      <p className="relative mt-2.5 w-full text-center text-xs sm:text-sm font-bold text-gray-900 truncate px-1">
        {profile.name}
        {isMe && (
          <span className="ml-1 text-[10px] font-bold text-[#F2754A]">You</span>
        )}
      </p>
      <p className="relative w-full text-center text-[10px] sm:text-xs text-gray-400 truncate px-1">
        {profile.current_role}
      </p>

      {/* Rank circle overlapping the pedestal */}
      <div
        className="relative z-10 mt-2.5 -mb-3.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold bg-white border-2"
        style={{ borderColor: tone.solid, color: tone.solid }}
      >
        {place}
      </div>

      {/* Pedestal */}
      <div
        className={`relative w-full rounded-xl flex items-end justify-center text-white font-bold ${
          first
            ? "h-20 sm:h-24 pb-3 text-base sm:text-xl"
            : place === 2
            ? "h-16 sm:h-20 pb-2.5 text-sm sm:text-lg"
            : "h-14 sm:h-16 pb-2.5 text-sm sm:text-lg"
        }`}
        style={{ background: tone.gradient }}
      >
        {entry.score}
      </div>
    </div>
  );
}

function Podium({
  entries,
  myUserId,
}: {
  entries: LeaderboardEntry[];
  myUserId?: string | number;
}) {
  const [first, second, third] = entries;

  return (
    <div className="grid grid-cols-3 items-end gap-2 sm:gap-5 max-w-lg mx-auto mb-6 sm:mb-8 pt-2">
      <div>
        {second && (
          <PodiumSlot entry={second} place={2} isMe={myUserId === second.user_id} />
        )}
      </div>
      <div>
        {first && (
          <PodiumSlot entry={first} place={1} isMe={myUserId === first.user_id} />
        )}
      </div>
      <div>
        {third && (
          <PodiumSlot entry={third} place={3} isMe={myUserId === third.user_id} />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Field selector — searchable dropdown
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
    <div className="relative mb-6 sm:mb-8" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between gap-3 w-full sm:w-72 px-3.5 sm:px-4 py-2.5 rounded-2xl bg-white border border-gray-100 text-sm font-bold text-gray-800 hover:bg-gray-50 transition-colors"
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
        <div className="absolute z-30 mt-2 w-full sm:w-80 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
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
  const [sharedBadge, setSharedBadge] = useState<ShareBadgeData | null>(null);
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

  const podiumEntries = entries.slice(0, 3);
  const restEntries = entries.slice(3);

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col md:flex-row">
      <DeveloperNavbar />
      <ShareBadgeModal
        badge={sharedBadge}
        isOpen={Boolean(sharedBadge)}
        onClose={() => setSharedBadge(null)}
      />

      <main className="flex-1 min-w-0 px-3 sm:px-4 md:px-8 py-4 sm:py-6 md:py-10 max-w-3xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <Trophy className="w-5 h-5 text-[#F2754A] flex-shrink-0" />
            <h1
              className="text-xl sm:text-2xl font-bold text-gray-900 truncate"
              style={{ fontFamily: "var(--font-fraunces, serif)" }}
            >
              Rankings
            </h1>
          </div>
          <WeekTimer />
        </div>
        <p className="text-xs sm:text-sm text-gray-400 mb-5 sm:mb-6">
          Ranked by Antyl Score within each field. Recalculated daily, movement resets weekly.
        </p>

        {/* Field selector — now at the top, directly under the header */}
        <FieldSelector
          fields={fields}
          selectedField={selectedField}
          onSelect={handleSelectField}
        />

        {/* Podium */}
        {!loading && !error && podiumEntries.length > 0 && (
          <Podium entries={podiumEntries} myUserId={myRank?.user_id} />
        )}

        {/* Your rank card */}
        {myRank && myRank.rank && myRank.field_of_work === selectedField && (
          <div className="bg-white rounded-2xl border border-gray-100 p-3.5 sm:p-4 mb-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <RankBadge rank={myRank.rank} />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">Your rank</p>
                  <p className="text-xs text-gray-400 truncate">{myRank.field_label}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 sm:gap-4 flex-shrink-0">
                <div className="text-right">
                  <p className="text-base sm:text-lg font-bold text-gray-900">
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
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50 overflow-x-auto">
                {badges.slice(0, 6).map((b, index) => {
                  const meta = badgeCatalog[b.badge_key];
                  if (!meta) return null;

                  const rank = resolveBadgeRank(
                    b.metadata as Record<string, unknown> | undefined
                  );
                  const fieldLabel = resolveBadgeFieldLabel(
                    b.metadata as Record<string, unknown> | undefined
                  );

                  return (
                    <button
                      key={`${b.badge_key}-${index}`}
                      type="button"
                      aria-label={`Share ${meta.label} badge`}
                      title={`Share ${meta.label}`}
                      onClick={() =>
                        setSharedBadge({
                          badgeKey: b.badge_key,
                          label: meta.label,
                          description: meta.description,
                          image: meta.image,
                          color: meta.color,
                          rank,
                          fieldLabel,
                        })
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-100 bg-white transition-transform hover:-translate-y-0.5 hover:shadow-sm flex-shrink-0"
                      style={{ backgroundColor: `${meta.color}14` }}
                    >
                      <img
                        src={meta.image}
                        alt={meta.label}
                        className="h-full w-full object-contain"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {myRank && !myRank.rank && (
          <div className="bg-white rounded-2xl border border-gray-100 p-3.5 sm:p-4 mb-5">
            <p className="text-sm font-semibold text-gray-700">You are not ranked yet</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Complete a verification to get an Antyl Score and appear on the leaderboard.
            </p>
          </div>
        )}

        {/* Rankings list (rank 4 and below; top 3 are on the podium) */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-6 h-6 border-2 border-gray-200 border-t-[#F2754A] rounded-full animate-spin mx-auto" />
            </div>
          ) : error ? (
            <div className="py-16 text-center px-6">
              <p className="text-sm font-semibold text-gray-700">Something went wrong</p>
              <p className="text-xs text-gray-400 mt-1">{error}</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="py-16 text-center px-6">
              <Trophy className="w-6 h-6 text-gray-200 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700">No rankings yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Be the first to get verified in this field.
              </p>
            </div>
          ) : restEntries.length === 0 ? (
            <div className="py-10 text-center px-6">
              <p className="text-xs text-gray-400">
                Everyone ranked in this field is on the podium.
              </p>
            </div>
          ) : (
            restEntries.map((entry) => {
              const isMe = myRank?.user_id === entry.user_id;
              return (
                <div
                  key={entry.user_id}
                  className={`flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-3 sm:py-3.5 border-b border-gray-50 last:border-0 ${
                    isMe ? "bg-orange-50/50" : ""
                  }`}
                >
                  <RankBadge rank={entry.rank} />

                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-50 flex-shrink-0 overflow-hidden">
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
                    <p className="text-sm font-bold text-gray-900">{entry.score}</p>
                  </div>

                  <div className="w-8 sm:w-10 flex-shrink-0 flex justify-end">
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