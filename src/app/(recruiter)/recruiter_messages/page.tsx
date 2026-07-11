"use client";

import { useEffect, useRef, useState } from "react";
import { Send, MessageCircle } from "lucide-react";
import {
  getConversations,
  getMessages,
  sendMessage,
  Conversation,
  AntylMessage,
  RECRUITER_QUICK_REPLIES,
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

export default function RecruiterMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<AntylMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function loadConversations(preserveSelection = true) {
    try {
      const data = await getConversations();
      setConversations(data);
      if (preserveSelection && selected) {
        const refreshed = data.find((c) => c.match_id === selected.match_id);
        if (refreshed) setSelected(refreshed);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
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

  async function openConversation(conv: Conversation) {
    setSelected(conv);
    try {
      const data = await getMessages(conv.match_id);
      setMessages(data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  async function handleSend(text: string) {
    if (!selected || !text.trim() || sending) return;
    setSending(true);
    try {
      const msg = await sendMessage(selected.match_id, text.trim());
      setMessages((prev) => [...prev, msg]);
      setDraft("");
      loadConversations(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="h-screen flex">
      {/* Conversation list */}
      <div
        className={`w-full md:w-80 flex-shrink-0 border-r border-gray-100 bg-white flex flex-col ${
          selected ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="px-6 py-5 border-b border-gray-50">
          <h1 className="text-lg font-bold text-gray-900">Messages</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingList ? (
            <p className="text-xs text-gray-400 text-center py-10">Loading…</p>
          ) : conversations.length === 0 ? (
            <div className="py-16 text-center px-6">
              <MessageCircle className="w-6 h-6 text-gray-200 mx-auto mb-2" />
              <p className="text-xs text-gray-400 font-medium">
                No conversations yet. Match with a candidate to start one.
              </p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.match_id}
                type="button"
                onClick={() => openConversation(conv)}
                className={`w-full text-left px-6 py-4 border-b border-gray-50 transition-colors ${
                  selected?.match_id === conv.match_id
                    ? "bg-orange-50"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {conv.other_party.name || "Candidate"}
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
                    : "No messages yet — say hi"}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat pane */}
      <div className={`flex-1 flex flex-col bg-[#FAF6F0] ${selected ? "flex" : "hidden md:flex"}`}>
        {!selected ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-gray-400 font-medium">
              Select a conversation to start messaging
            </p>
          </div>
        ) : (
          <>
            <div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between">
              <button
                type="button"
                className="md:hidden text-xs font-bold text-gray-400 mr-3"
                onClick={() => setSelected(null)}
              >
                ← Back
              </button>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {selected.other_party.name || "Candidate"}
                </p>
                <p className="text-[11px] text-gray-400 font-medium truncate">
                  {selected.job_title || "Job"}
                </p>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-3">
              {messages.length === 0 ? (
                <p className="text-xs text-gray-400 text-center mt-10">
                  Start the conversation — the candidate cannot reply until
                  you send the first message.
                </p>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-snug ${
                      m.sender_role === "recruiter"
                        ? "self-end text-white"
                        : "self-start bg-white text-gray-800 border border-gray-100"
                    }`}
                    style={
                      m.sender_role === "recruiter"
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
                        m.sender_role === "recruiter"
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

            {/* Quick-reply chips - recruiter only, taps send instantly */}
            <div className="px-6 pt-3 flex gap-2 flex-wrap bg-white border-t border-gray-50">
              {RECRUITER_QUICK_REPLIES.map((q) => (
                <button
                  key={q.label}
                  type="button"
                  disabled={sending}
                  onClick={() => handleSend(q.text)}
                  className="text-xs font-bold text-[#F2754A] bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
                >
                  {q.label}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(draft);
              }}
              className="px-6 py-4 bg-white flex items-center gap-3"
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Write a message…"
                className="flex-1 text-sm px-4 py-2.5 rounded-full border border-gray-200 focus:outline-none focus:border-[#F2754A]"
              />
              <button
                type="submit"
                disabled={sending || !draft.trim()}
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
  );
}