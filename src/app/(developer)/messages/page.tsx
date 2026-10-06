"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Send,
  MessageCircle,
  Clock,
  ChevronLeft,
  Search,
  Briefcase,
  X,
} from "lucide-react";
import DeveloperNavbar from "../components/DeveloperNavbar";
import {
  getConversations,
  getMessages,
  sendMessage,
  Conversation,
  AntylMessage,
} from "@/services/message.service";
import { linkify } from "@/lib/linkify";

// ── Helpers ───────────────────────────────────────────────────────────────────
const AVATAR_TINTS = ["#F2754A", "#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ec4899"];

function tintFor(text: string) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  return AVATAR_TINTS[hash % AVATAR_TINTS.length];
}

// First visible letter or digit; skips spaces and stray symbols so an avatar
// never renders blank. Returns null if there is none.
function initialOf(text?: string) {
  const match = text?.match(/[\p{L}\p{N}]/u);
  return match ? match[0].toUpperCase() : null;
}

function shortAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function clockTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function isSameDay(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

function dayLabel(iso: string) {
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const d = new Date(iso);
  if (d.toDateString() === now.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// Orders conversations by the most recently timestamped message. Threads with
// no messages yet go last.
function byRecent(a: Conversation, b: Conversation) {
  const at = a.last_message?.created_at ? new Date(a.last_message.created_at).getTime() : 0;
  const bt = b.last_message?.created_at ? new Date(b.last_message.created_at).getTime() : 0;
  return bt - at;
}

// Picks the conversation with the most recently timestamped message so we
// know which thread to open automatically on first load.
function getMostRecentConversation(convs: Conversation[]): Conversation | null {
  if (convs.length === 0) return null;
  return [...convs].sort(byRecent)[0];
}

// ── Small components ──────────────────────────────────────────────────────────
function Avatar({
  name,
  size = "md",
}: {
  name?: string;
  size?: "sm" | "md";
}) {
  const label = name || "Recruiter";
  const tint = tintFor(label);
  const dims = size === "sm" ? "w-7 h-7 text-xs" : "w-11 h-11 text-base";
  return (
    <div
      className={`${dims} rounded-full flex items-center justify-center font-bold flex-shrink-0`}
      style={{ background: `${tint}1A`, color: tint }}
      aria-hidden
    >
      {initialOf(label) ?? "R"}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="animate-pulse">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-3 px-4 sm:px-5 py-4 border-b border-gray-50">
          <div className="w-11 h-11 rounded-full bg-gray-100 flex-shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-3 w-1/2 bg-gray-100 rounded-full" />
            <div className="h-2.5 w-1/3 bg-gray-100 rounded-full" />
            <div className="h-2.5 w-4/5 bg-gray-100 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ThreadSkeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-3">
      <div className="h-10 w-2/3 bg-white rounded-2xl self-start" />
      <div className="h-10 w-1/2 bg-orange-100/70 rounded-2xl self-end" />
      <div className="h-14 w-3/5 bg-white rounded-2xl self-start" />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DeveloperMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<AntylMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [search, setSearch] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const selectedMatchIdRef = useRef<string | null>(null);

  useEffect(() => {
    selectedMatchIdRef.current = selected?.match_id ?? null;
  }, [selected]);

  async function openConversation(conv: Conversation) {
    // Set the ref immediately so a slow response for a previously opened
    // thread can't overwrite the one the developer just switched to.
    selectedMatchIdRef.current = conv.match_id;
    setSelected(conv);
    setMessages([]);
    setSendError("");
    setDraft("");
    setLoadingMessages(true);
    try {
      const data = await getMessages(conv.match_id);
      if (selectedMatchIdRef.current !== conv.match_id) return;
      setMessages(data);
      // Opening a thread marks it read on the server; refresh so the unread
      // badge clears without waiting for the next poll.
      if (conv.unread_count > 0) refreshList(true);
    } catch (err) {
      console.error(err);
    } finally {
      if (selectedMatchIdRef.current === conv.match_id) setLoadingMessages(false);
    }
  }

  function refreshList(preserveSelection: boolean) {
    return getConversations()
      .then((data) => {
        setConversations(data);
        if (preserveSelection) {
          setSelected((prev) =>
            prev ? data.find((c) => c.match_id === prev.match_id) ?? prev : prev
          );
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingList(false));
  }

  useEffect(() => {
    let active = true;

    async function load(preserveSelection: boolean) {
      try {
        const data = await getConversations();
        if (!active) return;
        setConversations(data);
        if (preserveSelection) {
          setSelected((prev) =>
            prev ? data.find((c) => c.match_id === prev.match_id) ?? prev : prev
          );
        }

        // On the very first load, open the most recently active conversation
        // automatically instead of leaving the developer on an empty pane.
        if (!preserveSelection && !selectedMatchIdRef.current && data.length > 0) {
          const latest = getMostRecentConversation(data);
          if (latest) {
            openConversation(latest);
          }
        }

        // While polling, also pull new messages for the open thread so a
        // recruiter's reply shows up without reopening the conversation.
        const openId = selectedMatchIdRef.current;
        if (preserveSelection && openId) {
          try {
            const fresh = await getMessages(openId);
            if (active && selectedMatchIdRef.current === openId) {
              setMessages((prev) =>
                prev.length === fresh.length &&
                prev[prev.length - 1]?.id === fresh[fresh.length - 1]?.id
                  ? prev
                  : fresh
              );
            }
          } catch (err) {
            console.error(err);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoadingList(false);
      }
    }

    load(false);
    const poll = setInterval(() => load(true), 20000);

    return () => {
      active = false;
      clearInterval(poll);
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loadingMessages]);

  async function handleSend() {
    if (!selected || !draft.trim() || sending) return;
    setSending(true);
    setSendError("");
    try {
      const msg = await sendMessage(selected.match_id, draft.trim());
      setMessages((prev) => [...prev, msg]);
      setDraft("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      refreshList(true);
    } catch (err) {
      console.error(err);
      setSendError("Your message could not be sent. Please try again.");
    } finally {
      setSending(false);
    }
  }

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }

  const visibleConversations = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...conversations]
      .sort(byRecent)
      .filter(
        (c) =>
          !q ||
          (c.other_party.name || "Recruiter").toLowerCase().includes(q) ||
          (c.job_title || "").toLowerCase().includes(q)
      );
  }, [conversations, search]);

  return (
    // flex-col on mobile so the navbar's mobile <header> (an in-flow
    // sibling returned alongside the fixed sidebar) stacks ABOVE this
    // content instead of sitting beside it in a row; md:flex-row for the
    // desktop side-by-side layout. flex-1 on <main> lets the navbar's own
    // spacer div reserve the correct width for the sidebar.
    <div className="h-screen w-full flex flex-col md:flex-row bg-[#FAF6F0] overflow-hidden">
      <DeveloperNavbar />

      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <div className="h-[calc(100vh-68px)] md:h-full flex overflow-hidden">
          {/* ── Conversation list ─────────────────────────────────────────── */}
          <div
            className={`w-full md:w-[22rem] flex-shrink-0 border-r border-gray-100 bg-white flex flex-col ${
              selected ? "hidden md:flex" : "flex"
            }`}
          >
            <div className="px-4 sm:px-5 pt-5 pb-3 flex-shrink-0">
              <div className="flex items-center justify-between mb-3.5">
                <h1
                  className="text-xl font-bold text-gray-900"
                  style={{ fontFamily: "var(--font-fraunces, serif)" }}
                >
                  Messages
                </h1>
                {conversations.length > 0 && (
                  <span className="text-xs font-semibold text-gray-400">
                    {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {conversations.length > 0 && (
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or job"
                    aria-label="Search conversations"
                    className="w-full h-10 pl-10 pr-9 rounded-full bg-gray-50 border border-gray-100 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:bg-white focus:border-[#F2754A] focus:ring-4 focus:ring-orange-100 transition"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      aria-label="Clear search"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto border-t border-gray-50">
              {loadingList ? (
                <ListSkeleton />
              ) : conversations.length === 0 ? (
                <div className="py-16 text-center px-8">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="w-6 h-6 text-[#F2754A]" />
                  </div>
                  <p className="text-sm font-bold text-gray-700">No conversations yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    They will show up here once a recruiter matches with you.
                  </p>
                </div>
              ) : visibleConversations.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-10 px-6">
                  No conversations match &ldquo;{search}&rdquo;.
                </p>
              ) : (
                visibleConversations.map((conv) => {
                  const active = selected?.match_id === conv.match_id;
                  const unread = conv.unread_count > 0;
                  const name = conv.other_party.name || "Recruiter";
                  return (
                    <button
                      key={conv.match_id}
                      type="button"
                      onClick={() => openConversation(conv)}
                      className={`relative w-full text-left flex items-start gap-3 px-4 sm:px-5 py-3.5 border-b border-gray-50 transition-colors ${
                        active ? "bg-orange-50" : "hover:bg-gray-50"
                      }`}
                    >
                      {active && (
                        <span
                          aria-hidden
                          className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-[#F2754A]"
                        />
                      )}
                      <Avatar name={name} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={`text-sm truncate ${
                              unread ? "font-bold text-gray-900" : "font-semibold text-gray-800"
                            }`}
                          >
                            {name}
                          </p>
                          {conv.last_message && (
                            <span
                              className={`text-[11px] flex-shrink-0 ${
                                unread ? "font-bold text-[#F2754A]" : "text-gray-400"
                              }`}
                            >
                              {shortAgo(conv.last_message.created_at)}
                            </span>
                          )}
                        </div>
                        <p className="flex items-center gap-1 text-[11px] text-gray-400 font-medium truncate mt-0.5">
                          <Briefcase className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{conv.job_title || "Job"}</span>
                        </p>
                        <div className="flex items-center justify-between gap-2 mt-1.5">
                          <p
                            className={`text-xs truncate ${
                              unread ? "text-gray-700 font-medium" : "text-gray-500"
                            }`}
                          >
                            {conv.last_message
                              ? conv.last_message.content
                              : "Waiting on the recruiter to reach out"}
                          </p>
                          {unread && (
                            <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#F2754A] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                              {conv.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* ── Chat pane ─────────────────────────────────────────────────── */}
          <div
            className={`w-full md:flex-1 bg-[#FAF6F0] flex flex-col min-h-0 min-w-0 ${
              selected ? "flex" : "hidden md:flex"
            }`}
          >
            {!selected ? (
              <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                <div className="w-14 h-14 rounded-3xl bg-white border border-gray-100 shadow-sm flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-[#F2754A]" />
                </div>
                <p className="text-sm font-bold text-gray-700">Select a conversation</p>
                <p className="text-xs text-gray-400 mt-1">
                  Pick a recruiter from the list to read and reply.
                </p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="px-4 sm:px-6 py-3 sm:py-3.5 bg-white border-b border-gray-100 flex items-center gap-3 flex-shrink-0">
                  <button
                    type="button"
                    aria-label="Back to conversations"
                    className="md:hidden w-8 h-8 -ml-1.5 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-50 flex-shrink-0"
                    onClick={() => setSelected(null)}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <Avatar name={selected.other_party.name || "Recruiter"} />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {selected.other_party.name || "Recruiter"}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-gray-400 font-medium truncate">
                      <Briefcase className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{selected.job_title || "Job"}</span>
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div
                  ref={scrollRef}
                  className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col"
                >
                  <div className="mt-auto flex flex-col">
                    {loadingMessages ? (
                      <ThreadSkeleton />
                    ) : messages.length === 0 ? (
                      <div className="text-center py-10">
                        <div className="w-11 h-11 rounded-2xl bg-white border border-gray-100 flex items-center justify-center mx-auto mb-3">
                          <Clock className="w-5 h-5 text-gray-300" />
                        </div>
                        <p className="text-sm font-semibold text-gray-600">No messages yet</p>
                        <p className="text-xs text-gray-400 mt-1">
                          The recruiter will reach out first.
                        </p>
                      </div>
                    ) : (
                      messages.map((m, i) => {
                        const prev = messages[i - 1];
                        const next = messages[i + 1];
                        const mine = m.sender_role === "developer";
                        const newDay = !prev || !isSameDay(prev.created_at, m.created_at);
                        const firstInGroup = newDay || prev.sender_role !== m.sender_role;
                        const lastInGroup =
                          !next ||
                          next.sender_role !== m.sender_role ||
                          !isSameDay(next.created_at, m.created_at);

                        return (
                          <div key={m.id}>
                            {newDay && (
                              <div className="flex items-center justify-center my-4 first:mt-0">
                                <span className="text-[11px] font-semibold text-gray-400 bg-white border border-gray-100 rounded-full px-3 py-1">
                                  {dayLabel(m.created_at)}
                                </span>
                              </div>
                            )}

                            <div
                              className={`flex items-end gap-2 ${
                                mine ? "justify-end" : "justify-start"
                              } ${firstInGroup && !newDay ? "mt-3" : "mt-1"}`}
                            >
                              {/* Recruiter avatar on the last bubble of a group */}
                              {!mine &&
                                (lastInGroup ? (
                                  <Avatar
                                    name={selected.other_party.name || "Recruiter"}
                                    size="sm"
                                  />
                                ) : (
                                  <div className="w-7 flex-shrink-0" />
                                ))}

                              <div
                                className={`max-w-[80%] sm:max-w-[65%] px-4 py-2.5 text-sm leading-relaxed rounded-2xl ${
                                  mine
                                    ? `text-white ${lastInGroup ? "rounded-br-md" : ""}`
                                    : `bg-white text-gray-800 border border-gray-100 ${
                                        lastInGroup ? "rounded-bl-md" : ""
                                      }`
                                }`}
                                style={
                                  mine
                                    ? {
                                        background:
                                          "linear-gradient(90deg, #F2754A 0%, #F8B36B 100%)",
                                      }
                                    : undefined
                                }
                              >
                                <p className="whitespace-pre-wrap break-words">{linkify(m.content)}</p>
                                {lastInGroup && (
                                  <p
                                    className={`text-[10px] mt-1 ${
                                      mine ? "text-white/80 text-right" : "text-gray-400"
                                    }`}
                                  >
                                    {clockTime(m.created_at)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Composer */}
                <div className="bg-white border-t border-gray-100 flex-shrink-0">
                  {!selected.can_send && (
                    <div className="flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-orange-50 text-xs font-semibold text-[#D9582F]">
                      <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                      You can reply once the recruiter sends the first message.
                    </div>
                  )}
                  {sendError && (
                    <p className="px-4 sm:px-6 pt-2.5 text-xs font-semibold text-[#D8452F]">
                      {sendError}
                    </p>
                  )}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSend();
                    }}
                    className="px-3 sm:px-6 py-3 sm:py-4 flex items-end gap-2 sm:gap-3"
                  >
                    <textarea
                      ref={textareaRef}
                      rows={1}
                      value={draft}
                      onChange={(e) => {
                        setDraft(e.target.value);
                        autoResize(e.target);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      disabled={!selected.can_send}
                      placeholder={
                        selected.can_send
                          ? "Write a message…"
                          : "Waiting for the recruiter to message first…"
                      }
                      className="flex-1 min-w-0 resize-none text-sm leading-snug px-4 py-2.5 rounded-3xl border border-gray-200 bg-white text-black placeholder:text-gray-400 focus:outline-none focus:border-[#F2754A] focus:ring-4 focus:ring-orange-100 disabled:bg-gray-50 disabled:text-gray-400 transition"
                    />
                    <button
                      type="submit"
                      aria-label="Send message"
                      disabled={sending || !draft.trim() || !selected.can_send}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white disabled:opacity-40 flex-shrink-0 transition-transform enabled:hover:scale-105"
                      style={{
                        background: "linear-gradient(90deg, #F2754A 0%, #F8B36B 100%)",
                      }}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}