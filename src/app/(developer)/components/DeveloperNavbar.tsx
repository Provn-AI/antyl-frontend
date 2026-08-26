"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Newspaper,
  FileText,
  User,
  LogOut,
  Heart,
  Bell,
  Sparkles,
  Eye,
  MessageCircle,
  Trophy,
  Flame,
  Medal,
  Crown,
  X,
  BookOpen,
  ShieldCheck,
  LayoutDashboard,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "@/services/notification.service";
import { getConversations, Conversation } from "@/services/message.service";
import { pingStreak } from "@/services/streak.service";
import { checkIsAdmin } from "@/services/weeklyQuestion.service";
import WeeklyQuestionPopup from "./WeeklyQuestionPopup";
import OnboardingTour from "@/components/OnboardingTour";
import { developerTourSteps, DEVELOPER_TOUR_KEY } from "@/lib/tourSteps";

interface AntylNotification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  metadata: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
}

type NewMessageToast = {
  key: string;
  match_id: string;
  name: string;
  text: string;
};

const TABS = [
  { label: "Jobs for you!",         href: "/feed",         icon: Newspaper,       tourId: "nav-feed" },
  { label: "Dashboard",    href: "/developer_dashboard", icon: LayoutDashboard, tourId: "nav-dashboard" },
  { label: "Leaderboard",  href: "/leaderboard",  icon: Trophy,          tourId: "nav-leaderboard" },
  { label: "Applications", href: "/applications", icon: FileText,        tourId: "nav-applications" },
  { label: "My Saved Jobs", href: "/bookmarks",    icon: Heart,           tourId: "nav-bookmarks" },
  { label: "Messages",     href: "/messages",     icon: MessageCircle,   tourId: "nav-messages" },
  { label: "Blog",         href: "/blog",         icon: BookOpen,        tourId: "nav-blog" },
  { label: "Profile",      href: "/profile",      icon: User,            tourId: "nav-profile" },
];

const POLL_INTERVAL_MS = 25000;
const MESSAGE_POLL_INTERVAL_MS = 20000;
const PANEL_WIDTH = 320;
const SIDEBAR_COLLAPSE_KEY = "antyl_developer_nav_collapsed";

// Persists which milestone celebration popups have already been shown
// (or dismissed) in this browser. This is the durable guard — an
// in-memory ref alone isn't enough because this navbar remounts on
// every tab/route change (it's rendered per-page, not from a shared
// layout), which would otherwise wipe the "already shown" set and let
// a milestone notification pop again, especially if the mark-as-read
// PATCH from a previous dismissal hasn't committed server-side yet by
// the time the next mount re-fetches notifications.
const SHOWN_CELEBRATIONS_KEY = "antyl_shown_celebration_ids";
const SHOWN_CELEBRATIONS_MAX = 300;

function loadShownCelebrationIds(): Set<string> {
  try {
    const stored = localStorage.getItem(SHOWN_CELEBRATIONS_KEY);
    if (!stored) return new Set();
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? new Set(parsed) : new Set();
  } catch {
    return new Set();
  }
}

function saveShownCelebrationIds(ids: Set<string>) {
  try {
    // Cap so this can't grow unbounded over months of use.
    const arr = Array.from(ids).slice(-SHOWN_CELEBRATIONS_MAX);
    localStorage.setItem(SHOWN_CELEBRATIONS_KEY, JSON.stringify(arr));
  } catch {
    // ignore quota/serialization errors — worst case we lose the guard
    // for this session, we don't want to break notification loading over it
  }
}

const MILESTONE_TYPES = ["streak_daily", "streak_week", "streak_month", "podium_finish", "field_leader"];

const MILESTONE_STYLES: Record<string, { icon: typeof Flame; color: string; title: string }> = {
  streak_daily: { icon: Flame, color: "#F2754A", title: "Streak Alive!" },
  streak_week: { icon: Flame, color: "#F2754A", title: "7-Day Streak!" },
  streak_month: { icon: Trophy, color: "#FFB347", title: "30-Day Streak!" },
  podium_finish: { icon: Medal, color: "#E3B27B", title: "Podium Finish!" },
  field_leader: { icon: Crown, color: "#FFD37A", title: "Field Leader!" },
};

// ── Time-of-day gif, shown at the bottom of the sidebar ──
// Split into three 8-hour blocks:
//   morning:   6:00  - 13:59
//   afternoon: 14:00 - 21:59
//   evening:   22:00 - 5:59
type TimeOfDay = "morning" | "afternoon" | "evening";

const TIME_OF_DAY_GIFS: Record<TimeOfDay, string> = {
  morning: "/morning.gif",
  afternoon: "/afternoon.gif",
  evening: "/night.gif",
};

// Hover tooltip copy for each time-of-day gif.
const TIME_OF_DAY_MESSAGES: Record<TimeOfDay, string> = {
  morning: "Good morning! Antyl's up and hunting for jobs ☀️",
  afternoon: "Afternoon grind — Antyl's still on it 💪",
  evening: "Time to sleep, Antyl is on rest 🌙",
};

function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 14) return "morning";
  if (hour >= 14 && hour < 22) return "afternoon";
  return "evening";
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// Where a notification should take the user when clicked. Falls back to
// the feed for any type we don't have a specific destination for.
function getNotificationHref(n: AntylNotification): string {
  switch (n.type) {
    case "match":
      return "/applications";
    case "profile_viewed":
      return "/profile";
    case "message":              
      return "/messages";
    case "streak_daily":
    case "streak_week":
    case "streak_month":
    case "podium_finish":
    case "field_leader":
      return "/leaderboard";
    default:
      return "/feed";
  }
}

function NotifIcon({ type }: { type: string }) {
  if (type === "match") return <Sparkles className="w-3.5 h-3.5 text-emerald-500" />;
  if (type === "profile_viewed") return <Eye className="w-3.5 h-3.5 text-blue-500" />;
  if (type === "message") return <MessageCircle className="w-3.5 h-3.5 text-[#F2754A]" />; 
  if (type === "streak_daily") return <Flame className="w-3.5 h-3.5 text-[#F2754A]" />;
  if (type === "streak_week") return <Flame className="w-3.5 h-3.5 text-[#F2754A]" />;
  if (type === "streak_month") return <Trophy className="w-3.5 h-3.5 text-[#FFB347]" />;
  if (type === "podium_finish") return <Medal className="w-3.5 h-3.5 text-[#E3B27B]" />;
  if (type === "field_leader") return <Crown className="w-3.5 h-3.5 text-[#FFD37A]" />;
  return <Bell className="w-3.5 h-3.5 text-gray-400" />;
}

// ── Milestone celebration popup ──

function MilestoneCelebration({
  notification,
  onClose,
}: {
  notification: AntylNotification;
  onClose: () => void;
}) {
  const style = MILESTONE_STYLES[notification.type];
  if (!style) return null;
  const Icon = style.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-[24px] shadow-2xl p-7 text-center">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center"
        >
          <X className="w-3.5 h-3.5 text-gray-400" />
        </button>
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: `linear-gradient(135deg, ${style.color}, #FFB347)` }}
        >
          <Icon className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">{style.title}</h3>
        <p className="text-sm text-gray-500">{notification.message}</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full py-2.5 rounded-full text-sm font-bold text-white bg-[#F2754A] hover:bg-[#e0623a] transition-colors"
        >
          Nice!
        </button>
      </div>
    </div>
  );
}

// ── New-message popup, anchored near the Messages nav icon ──

function NewMessagePopup({
  toast,
  onOpen,
  onClose,
  mobile = false,
  leftOffsetClass,
}: {
  toast: NewMessageToast;
  onOpen: () => void;
  onClose: () => void;
  mobile?: boolean;
  leftOffsetClass: string;
}) {
  return (
    <div
      className={`fixed z-[90] w-80 max-w-[calc(100vw-2rem)] animate-in fade-in slide-in-from-left-2 ${
        mobile ? "top-16 left-4 right-4 w-auto" : `${leftOffsetClass} top-6`
      }`}
    >
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 flex gap-3 items-start">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white"
          style={{ background: "linear-gradient(90deg, #F2754A 0%, #F8B36B 100%)" }}
        >
          <MessageCircle className="w-4 h-4" />
        </div>
        <button type="button" onClick={onOpen} className="flex-1 text-left min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">
            New message from {toast.name}
          </p>
          <p className="text-xs text-gray-500 truncate mt-0.5">{toast.text}</p>
        </button>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-300 hover:text-gray-500 flex-shrink-0"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function BellButton({
  mobile = false,
  unreadCount,
  panelOpen,
  onClick,
  buttonRef,
}: {
  mobile?: boolean;
  unreadCount: number;
  panelOpen: boolean;
  onClick: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      className={`relative flex items-center justify-center rounded-full transition-colors ${
        mobile
          ? "w-8 h-8 bg-gray-50 hover:bg-gray-100"
          : "w-9 h-9 hover:bg-gray-50"
      }`}
    >
      <Bell className={`${mobile ? "w-4 h-4" : "w-4.5 h-4.5"} ${panelOpen ? "text-[#F2754A]" : "text-gray-500"}`} />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#F2754A] text-white text-[9px] font-black flex items-center justify-center">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}

// ── Renders via fixed positioning, computed from the bell button's actual
// screen coordinates, so it's never clipped by the sidebar's width/overflow. ──
function NotificationPanel({
  notifications,
  onNotificationClick,
  onMarkAllRead,
  onClose,
  anchorRect,
}: {
  notifications: AntylNotification[];
  onNotificationClick: (n: AntylNotification) => void;
  onMarkAllRead: () => void;
  onClose: () => void;
  anchorRect: DOMRect;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Anchor to the bell's right edge, but clamp so the panel never runs
  // off either side of the viewport.
  const rawLeft = anchorRect.right - PANEL_WIDTH;
  const left = Math.min(
    Math.max(rawLeft, 8),
    window.innerWidth - PANEL_WIDTH - 8
  );
  const top = anchorRect.bottom + 8;

  return (
    <div
      ref={panelRef}
      style={{ position: "fixed", top, left, width: PANEL_WIDTH }}
      className="max-h-[420px] bg-white rounded-[20px] border border-gray-100 shadow-xl overflow-hidden flex flex-col z-[80]"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 flex-shrink-0">
        <p className="text-sm font-bold text-gray-900">Notifications</p>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="text-[11px] font-bold text-[#F2754A] hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-10 text-center">
            <Bell className="w-6 h-6 text-gray-200 mx-auto mb-2" />
            <p className="text-xs text-gray-400 font-medium">No notifications yet</p>
          </div>
        ) : (
          notifications.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => onNotificationClick(n)}
              className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-0 transition-colors ${
                n.is_read ? "bg-white hover:bg-gray-50" : "bg-orange-50/40 hover:bg-orange-50"
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <NotifIcon type={n.type} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs leading-snug ${n.is_read ? "text-gray-500" : "text-gray-800 font-semibold"}`}>
                  {n.message}
                </p>
                <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
              </div>
              {!n.is_read && (
                <span className="w-2 h-2 rounded-full bg-[#F2754A] flex-shrink-0 mt-1.5" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export default function DeveloperNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [notifications, setNotifications] = useState<AntylNotification[]>([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [celebration, setCelebration] = useState<AntylNotification | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const desktopBellRef = useRef<HTMLButtonElement>(null);
  const mobileBellRef = useRef<HTMLButtonElement>(null);
  const shownCelebrationIds = useRef<Set<string>>(new Set());
  const [isAdmin, setIsAdmin] = useState(false);
  const [tourActive, setTourActive] = useState(false);

  // ── Sidebar collapse — persisted so it survives navigation/reloads.
  // Now honored on every route (not just the dashboard), so the toggle
  // works everywhere.
  const [collapsed, setCollapsed] = useState(false);
  const effectiveCollapsed = collapsed;

  // ── Time-of-day gif shown at the bottom of the sidebar ──
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(() => getTimeOfDay());

  useEffect(() => {
    const interval = setInterval(() => setTimeOfDay(getTimeOfDay()), 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSE_KEY);
    // Reading localStorage requires an effect (unavailable during SSR, and
    // reading it directly in the render body would cause a hydration
    // mismatch). The resulting setState-in-effect warning is a false
    // positive for this "sync from external system on mount" pattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored === "1") setCollapsed(true);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_COLLAPSE_KEY, next ? "1" : "0");
      return next;
    });
  };

  // ── Messages: unread badge on the nav icon + a popup for new incoming
  // messages, same idea as the notifications bell above but sourced from
  // getConversations() instead of the notifications endpoint.
  const [unreadMessagesTotal, setUnreadMessagesTotal] = useState(0);
  const [messageToast, setMessageToast] = useState<NewMessageToast | null>(null);
  const lastSeenRef = useRef<Record<string, string | null>>({});
  const messageToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onMessagesPage = pathname === "/messages";

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Daily login streak — idempotent server-side, safe to call on every mount.
  useEffect(() => {
    pingStreak().catch(() => {});
  }, []);

  // Admin tab visibility — email whitelist check, backend is the real gate.
  useEffect(() => {
    checkIsAdmin().then(setIsAdmin);
  }, []);

  // First-login onboarding tour — desktop only, since the sidebar (where
  // every data-tour anchor lives) is hidden below md.
  useEffect(() => {
    if (window.innerWidth < 768) return;
    if (!localStorage.getItem(DEVELOPER_TOUR_KEY)) {
      const t = setTimeout(() => setTourActive(true), 500);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    // Restore previously-shown/dismissed milestone celebration ids from
    // localStorage before the first load(). This is the durable guard —
    // shownCelebrationIds alone is an in-memory ref, so it resets every
    // time this component remounts (e.g. on tab/route change, since this
    // navbar isn't part of a persistent shared layout). Without this,
    // a milestone notification that's still is_read: false — either
    // because the user hasn't dismissed it yet, or because the
    // mark-as-read PATCH from a previous dismissal hasn't committed
    // server-side yet — would pop the celebration again on every remount.
    shownCelebrationIds.current = loadShownCelebrationIds();

    async function load() {
      try {
        const data: AntylNotification[] = await getNotifications();
        setNotifications(data);

        const milestone = data.find(
          (n) =>
            MILESTONE_TYPES.includes(n.type) &&
            !n.is_read &&
            !shownCelebrationIds.current.has(n.id)
        );
        if (milestone) {
          shownCelebrationIds.current.add(milestone.id);
          saveShownCelebrationIds(shownCelebrationIds.current);
          setCelebration(milestone);
        }
      } catch (err) {
        console.error(err);
      }
    }
    load();
    pollRef.current = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // Site-wide unread badge + new-message popup for the Messages nav icon.
  // Lives in the navbar (not just the messages page) so it works no
  // matter which developer page is open.
  useEffect(() => {
    let active = true;

    async function poll(isFirstLoad: boolean) {
      try {
        const data: Conversation[] = await getConversations();
        if (!active) return;

        setUnreadMessagesTotal(data.reduce((sum, c) => sum + (c.unread_count || 0), 0));

        const seenBefore = lastSeenRef.current;
        const nextSeen: Record<string, string | null> = {};

        for (const conv of data) {
          const newLastId = conv.last_message?.id ?? null;
          nextSeen[conv.match_id] = newLastId;

          if (isFirstLoad) continue; // don't pop a toast for pre-existing messages on mount

          const prevLastId = seenBefore[conv.match_id];
          const isNew = newLastId !== null && newLastId !== prevLastId;
          const isIncoming = conv.last_message?.sender_role !== "developer";

          // Don't pop the toast while already sitting in that thread.
          if (isNew && isIncoming && !onMessagesPage) {
            setMessageToast({
              key: newLastId as string,
              match_id: conv.match_id,
              name: conv.other_party.name || "Recruiter",
              text: conv.last_message?.content ?? "",
            });
            if (messageToastTimerRef.current) clearTimeout(messageToastTimerRef.current);
            messageToastTimerRef.current = setTimeout(() => setMessageToast(null), 6000);
          }
        }

        lastSeenRef.current = nextSeen;
      } catch (err) {
        console.error(err);
      }
    }

    poll(true);
    const interval = setInterval(() => poll(false), MESSAGE_POLL_INTERVAL_MS);

    return () => {
      active = false;
      clearInterval(interval);
      if (messageToastTimerRef.current) clearTimeout(messageToastTimerRef.current);
    };
  }, [onMessagesPage]);

  const openPanel = (ref: React.RefObject<HTMLButtonElement | null>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) setAnchorRect(rect);
    setPanelOpen((v) => !v);
  };

  const handleMarkRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    try {
      await markNotificationRead(id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await markAllNotificationsRead();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCelebrationClose = () => {
    if (celebration) {
      // Belt-and-suspenders: make sure this id is recorded as shown
      // even if it somehow wasn't added at fetch-time (e.g. celebration
      // was set through some other path in the future).
      shownCelebrationIds.current.add(celebration.id);
      saveShownCelebrationIds(shownCelebrationIds.current);
      handleMarkRead(celebration.id);
    }
    setCelebration(null);
  };

  // Clicking a notification: mark it read (if it wasn't already), close
  // the panel, and route to the relevant tab for that notification type.
  const handleNotificationClick = (n: AntylNotification) => {
    if (!n.is_read) handleMarkRead(n.id);
    setPanelOpen(false);
    router.push(getNotificationHref(n));
  };

  const handleMessageToastOpen = () => {
    setMessageToast(null);
    router.push("/messages");
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    window.location.href = "/";
  };

  return (
    <>
      {/* ── Left sidebar (desktop) ── */}
      <aside
        className={`hidden md:flex flex-col fixed left-0 top-0 h-full bg-white border-r border-gray-100 z-50 px-3 py-6 transition-all duration-200 ease-in-out ${
          effectiveCollapsed ? "w-20" : "w-56"
        }`}
      >
        {/* Toggle handle — pinned to the sidebar's right edge, vertically
            centered against the logo row. Now shown on every route. */}
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 hover:text-[#F2754A] hover:border-[#F2754A] transition-colors z-10"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        <div className={`flex items-center mb-6 ${effectiveCollapsed ? "flex-col gap-3" : "justify-between px-1"}`}>
          <Link href="/feed" className="flex items-center" aria-label="Home">
            <Image
              src="/Antyl.png"
              alt="Antyl logo"
              width={effectiveCollapsed ? 30 : 70}
              height={effectiveCollapsed ? 30 : 30}
              className="object-contain"
            />
          </Link>
          <div data-tour="nav-bell">
            <BellButton
              buttonRef={desktopBellRef}
              unreadCount={unreadCount}
              panelOpen={panelOpen}
              onClick={() => openPanel(desktopBellRef)}
            />
          </div>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {TABS.map(({ label, href, icon: Icon, tourId }) => {
            const active = pathname === href;
            const isMessages = href === "/messages";
            return (
              <Link
                key={href}
                href={href}
                data-tour={tourId}
                title={effectiveCollapsed ? label : undefined}
                className={`flex items-center py-2.5 rounded-2xl text-sm font-semibold transition-colors ${
                  effectiveCollapsed ? "justify-center px-0" : "gap-3 px-3"
                } ${
                  active
                    ? "bg-orange-50 text-[#F2754A]"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <span className="relative inline-flex">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-[#F2754A]" : "text-gray-400"}`} />
                  {isMessages && unreadMessagesTotal > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[15px] h-[15px] px-1 rounded-full bg-[#F2754A] text-white text-[9px] font-bold flex items-center justify-center">
                      {unreadMessagesTotal > 9 ? "9+" : unreadMessagesTotal}
                    </span>
                  )}
                </span>
                {!effectiveCollapsed && label}
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              href="/admin/weekly-question"
              data-tour="nav-admin"
              title={effectiveCollapsed ? "Admin" : undefined}
              className={`flex items-center py-2.5 rounded-2xl text-sm font-semibold transition-colors ${
                effectiveCollapsed ? "justify-center px-0" : "gap-3 px-3"
              } ${
                pathname === "/admin/weekly-question"
                  ? "bg-orange-50 text-[#F2754A]"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              <ShieldCheck
                className={`w-4 h-4 flex-shrink-0 ${
                  pathname === "/admin/weekly-question" ? "text-[#F2754A]" : "text-gray-400"
                }`}
              />
              {!effectiveCollapsed && "Admin"}
            </Link>
          )}
        </nav>

        {/* ── Time-of-day gif ── swaps between morning/afternoon/evening
            based on the current local hour (8-hour blocks). Lives just
            above the tour/logout buttons at the bottom of the sidebar.
            Square container so the gif is never stretched into an oval.
            Hovering shows a speech-bubble tooltip with a matching message. */}
        <div className={`flex items-center justify-center mb-3 ${effectiveCollapsed ? "px-0" : "px-10"}`}>
          <div className={`group relative block ${effectiveCollapsed ? "w-auto" : "w-full"}`}>
            {/* Speech bubble — hidden by default, fades/slides in on hover */}
            <div
              className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[180px]
                         opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0
                         transition-all duration-200 ease-out z-20"
            >
              <div className="relative rounded-xl bg-gray-900 text-white text-[11px] leading-snug font-medium px-3 py-2 shadow-lg text-center">
                {TIME_OF_DAY_MESSAGES[timeOfDay]}
                {/* tail */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45 -mt-1" />
              </div>
            </div>

            <div
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-b from-orange-50 to-white border border-orange-100/70 cursor-default ${
                effectiveCollapsed ? "w-8 h-8" : "w-full aspect-square"
              }`}
            >
              <Image
                src={TIME_OF_DAY_GIFS[timeOfDay]}
                alt={`${timeOfDay} illustration`}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setTourActive(true)}
          title={effectiveCollapsed ? "Take a tour" : undefined}
          className={`flex items-center py-2.5 rounded-2xl text-sm font-semibold text-gray-400 hover:bg-orange-50 hover:text-[#F2754A] transition-colors w-full text-left ${
            effectiveCollapsed ? "justify-center px-0" : "gap-3 px-3"
          }`}
        >
          <HelpCircle className="w-4 h-4 flex-shrink-0" />
          {!effectiveCollapsed && "Take a tour"}
        </button>

        <button
          type="button"
          onClick={handleLogout}
          title={effectiveCollapsed ? "Logout" : undefined}
          className={`flex items-center py-2.5 rounded-2xl text-sm font-semibold text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors w-full text-left ${
            effectiveCollapsed ? "justify-center px-0" : "gap-3 px-3"
          }`}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!effectiveCollapsed && "Logout"}
        </button>
      </aside>

      {/* ── Top bar (mobile) ── */}
      <header className="md:hidden bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="px-4 h-14 flex items-center justify-between">
          <Link href="/feed" className="flex items-center" aria-label="Home">
            <Image src="/Antyl.png" alt="Antyl logo" width={90} height={26} />
          </Link>

          <div className="flex items-center gap-2">
            <BellButton
              mobile
              buttonRef={mobileBellRef}
              unreadCount={unreadCount}
              panelOpen={panelOpen}
              onClick={() => openPanel(mobileBellRef)}
            />
            {isAdmin && (
              <Link
                href="/admin/weekly-question"
                className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center flex-shrink-0"
              >
                <ShieldCheck className="w-4 h-4 text-gray-500" />
              </Link>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 px-3 py-1.5 rounded-full transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>

        <div className="flex border-t border-gray-100">
          {TABS.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            const isMessages = href === "/messages";
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-bold transition-colors ${
                  active ? "text-[#F2754A]" : "text-gray-400"
                }`}
              >
                <span className="relative inline-flex">
                  <Icon className={`w-4 h-4 ${active ? "text-[#F2754A]" : "text-gray-400"}`} />
                  {isMessages && unreadMessagesTotal > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] px-1 rounded-full bg-[#F2754A] text-white text-[8px] font-bold flex items-center justify-center">
                      {unreadMessagesTotal > 9 ? "9+" : unreadMessagesTotal}
                    </span>
                  )}
                </span>
                {label}
              </Link>
            );
          })}
        </div>
      </header>

      <div
        className={`hidden md:block flex-shrink-0 transition-all duration-200 ease-in-out ${
          effectiveCollapsed ? "w-20" : "w-56"
        }`}
      />

      {/* ── Panel rendered once, fixed-positioned relative to whichever bell was clicked ── */}
      {panelOpen && anchorRect && (
        <NotificationPanel
          notifications={notifications}
          onNotificationClick={handleNotificationClick}
          onMarkAllRead={handleMarkAllRead}
          onClose={() => setPanelOpen(false)}
          anchorRect={anchorRect}
        />
      )}

      {/* ── New-message popup for the Messages nav icon ── */}
      {messageToast && (
        <NewMessagePopup
          toast={messageToast}
          onOpen={handleMessageToastOpen}
          onClose={() => setMessageToast(null)}
          mobile={typeof window !== "undefined" && window.innerWidth < 768}
          leftOffsetClass={effectiveCollapsed ? "left-24" : "left-60"}
        />
      )}

      {/* ── Milestone celebration popup ── */}
      {celebration && (
        <MilestoneCelebration notification={celebration} onClose={handleCelebrationClose} />
      )}

      {/* Weekly question popup — checks itself on mount whether there's
          an unanswered question for this user; audience is derived
          server-side from the JWT, no prop needed. */}
      <WeeklyQuestionPopup />

      {/* First-login onboarding tour — desktop only, replayable via the
          "Take a tour" sidebar button. */}
      <OnboardingTour
        steps={developerTourSteps}
        storageKey={DEVELOPER_TOUR_KEY}
        active={tourActive}
        onFinish={() => setTourActive(false)}
      />
    </>
  );
}