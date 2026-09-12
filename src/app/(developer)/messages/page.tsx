"use client";

import { useEffect, useRef, useState } from "react";
import { Send, MessageCircle, Clock, ChevronLeft } from "lucide-react";
import DeveloperNavbar from "../components/DeveloperNavbar";
import {
  getConversations,
  getMessages,
  sendMessage,
  Conversation,
  AntylMessage,
} from "@/services/message.service";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// Picks the conversation with the most recently timestamped message so we
// know which thread to open automatically on first load. Falls back to the
// first conversation in the list if nothing has a timestamp we can compare.
function getMostRecentConversation(convs: Conversation[]): Conversation | null {
  if (convs.length === 0) return null;
  return [...convs].sort((a, b) => {
    const at = a.last_message?.created_at
      ? new Date(a.last_message.created_at).getTime()
      : 0;
    const bt = b.last_message?.created_at
      ? new Date(b.last_message.created_at).getTime()
      : 0;
    return bt - at;
  })[0];
}

export default function DeveloperMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<AntylMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedMatchIdRef = useRef<string | null>(null);

  useEffect(() => {
    selectedMatchIdRef.current = selected?.match_id ?? null;
  }, [selected]);

  async function openConversation(conv: Conversation) {
    setSelected(conv);
    try {
      const data = await getMessages(conv.match_id);
      setMessages(data);
    } catch (err) {
      console.error(err);
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
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  async function handleSend() {
    if (!selected || !draft.trim() || sending) return;
    setSending(true);
    try {
      const msg = await sendMessage(selected.match_id, draft.trim());
      setMessages((prev) => [...prev, msg]);
      setDraft("");
      refreshList(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  }

  return (
    // flex-col on mobile so the navbar's mobile <header> (an in-flow
    // sibling returned alongside the fixed sidebar) stacks ABOVE this
    // content instead of sitting beside it in a row; md:flex-row for the
    // desktop side-by-side layout. The chat panel below no longer uses a
    // hardcoded md:ml-56 — that was 224px while the sidebar itself is
    // actually 256px expanded (or 96px collapsed), so it never matched
    // and clipped ~32px of every line of text behind the sidebar's right
    // edge. flex-1 here lets the navbar's own spacer div (rendered inside
    // DeveloperNavbar, sized to match the sidebar's real, current width)
    // reserve the correct space instead.
    <div className="h-screen w-full flex flex-col md:flex-row bg-[#FAF6F0] overflow-hidden">
      <DeveloperNavbar />

      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <div className="h-[calc(100vh-68px)] md:h-full flex overflow-hidden">
          {/* Conversation list */}
          <div
            className={`w-full md:w-80 flex-shrink-0 border-r border-gray-100 bg-white flex flex-col ${
              selected ? "hidden md:flex" : "flex"
            }`}
          >
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-50 flex-shrink-0">
              <h1 className="text-lg font-bold text-gray-900">Messages</h1>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingList ? (
                <p className="text-xs text-gray-400 text-center py-10">Loading…</p>
              ) : conversations.length === 0 ? (
                <div className="py-16 text-center px-6">
                  <MessageCircle className="w-6 h-6 text-gray-200 mx-auto mb-2" />
                  <p className="text-xs text-gray-400 font-medium">
                    No conversations yet. They will show up here once a recruiter
                    matches with you.
                  </p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.match_id}
                    type="button"
                    onClick={() => openConversation(conv)}
                    className={`w-full text-left px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-50 transition-colors ${
                      selected?.match_id === conv.match_id
                        ? "bg-orange-50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {conv.other_party.name || "Recruiter"}
                      </p>
                      {conv.unread_count > 0 && (
                        <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#F2754A] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 font-medium truncate mt-0.5">
                      {conv.job_title || "Job"}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-1.5">
                      {conv.last_message
                        ? conv.last_message.content
                        : "Waiting on the recruiter to reach out"}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat pane */}
          <div
            className={`w-full md:flex-1 bg-white flex flex-col min-h-0 ${
              selected ? "flex" : "hidden md:flex"
            }`}
          >
            {!selected ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-gray-400 font-medium">
                  Select a conversation to view messages
                </p>
              </div>
            ) : (
              <>
                <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-white border-b border-gray-100 flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    aria-label="Back to conversations"
                    className="md:hidden w-7 h-7 -ml-1 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-50 flex-shrink-0"
                    onClick={() => setSelected(null)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {selected.other_party.name || "Recruiter"}
                    </p>
                    <p className="text-[11px] text-gray-400 font-medium truncate">
                      {selected.job_title || "Job"}
                    </p>
                  </div>
                </div>

                <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col justify-end gap-3">
                  {messages.length === 0 ? (
                    <div className="text-center mt-10">
                      <Clock className="w-5 h-5 text-gray-200 mx-auto mb-2" />
                      <p className="text-xs text-gray-400">
                        No messages yet. The recruiter will reach out first.
                      </p>
                    </div>
                  ) : (
                    messages.map((m) => (
                      <div
                        key={m.id}
                        className={`max-w-[85%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-snug ${
                          m.sender_role === "developer"
                            ? "self-end text-white"
                            : "self-start bg-white text-gray-800 border border-gray-100"
                        }`}
                        style={
                          m.sender_role === "developer"
                            ? {
                                background:
                                  "linear-gradient(90deg, #F2754A 0%, #F8B36B 100%)",
                              }
                            : undefined
                        }
                      >
                        <p>{m.content}</p>
                        <p
                          className={`text-[10px] mt-1 ${
                            m.sender_role === "developer"
                              ? "text-white/70"
                              : "text-gray-400"
                          }`}
                        >
                          {timeAgo(m.created_at)}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="px-3 sm:px-6 py-3 sm:py-4 bg-white border-t border-gray-50 flex items-center gap-2 sm:gap-3 flex-shrink-0"
                >
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    disabled={!selected.can_send}
                    placeholder={
                      selected.can_send
                        ? "Write a message…"
                        : "Waiting for the recruiter to message first…"
                    }
                    className="flex-1 min-w-0 text-sm px-4 py-2.5 rounded-full border border-gray-200 text-black focus:outline-none focus:border-[#F2754A] disabled:bg-gray-50 disabled:text-gray-400"
                  />
                  <button
                    type="submit"
                    disabled={sending || !draft.trim() || !selected.can_send}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white disabled:opacity-40 flex-shrink-0"
                    style={{
                      background:
                        "linear-gradient(90deg, #F2754A 0%, #F8B36B 100%)",
                    }}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}