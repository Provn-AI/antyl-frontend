"use client";

import { useEffect, useRef, useState } from "react";
import { Send, MessageCircle, Clock } from "lucide-react";
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

export default function DeveloperMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<AntylMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

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
    <div className="h-screen w-full bg-[#FAF6F0] overflow-hidden">
      <DeveloperNavbar />

<div className="h-full md:ml-56 flex overflow-hidden">        {/* Conversation list */}
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
                  className={`w-full text-left px-6 py-4 border-b border-gray-50 transition-colors ${
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
          className={`w-full md:flex-1 bg-white flex flex-col ${
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
                    {selected.other_party.name || "Recruiter"}
                  </p>
                  <p className="text-[11px] text-gray-400 font-medium truncate">
                    {selected.job_title || "Job"}
                  </p>
                </div>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 flex flex-col justify-end gap-3">
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
                      className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-snug ${
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
                className="px-6 py-4 bg-white flex items-center gap-3"
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
                  className="flex-1 text-sm px-4 py-2.5 rounded-full border border-gray-200 focus:outline-none focus:border-[#F2754A] disabled:bg-gray-50 disabled:text-gray-400"
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
    </div>
  );
}