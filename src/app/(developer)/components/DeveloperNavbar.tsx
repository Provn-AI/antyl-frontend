"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Newspaper,
  FileText,
  User,
  LogOut,
  Bookmark,
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
  HelpCircle
} from "lucide-react";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "@/services/notification.service";
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

const TABS = [
  { label: "Feed",         href: "/feed",         icon: Newspaper,       tourId: "nav-feed" },
  { label: "Dashboard",    href: "/developer_dashboard", icon: LayoutDashboard, tourId: "nav-dashboard" },
  { label: "Leaderboard",  href: "/leaderboard",  icon: Trophy,          tourId: "nav-leaderboard" },
  { label: "Applications", href: "/applications", icon: FileText,        tourId: "nav-applications" },
  { label: "Bookmarks",    href: "/bookmarks",    icon: Bookmark,        tourId: "nav-bookmarks" },
  { label: "Messages",     href: "/messages",     icon: MessageCircle,   tourId: "nav-messages" },
  { label: "Blog",         href: "/blog",         icon: BookOpen,        tourId: "nav-blog" },
  { label: "Profile",      href: "/profile",      icon: User,            tourId: "nav-profile" },
];

const POLL_INTERVAL_MS = 25000;
const PANEL_WIDTH = 320;

const MILESTONE_TYPES = ["streak_daily", "streak_week", "streak_month", "podium_finish", "field_leader"];

const MILESTONE_STYLES: Record<string, { icon: typeof Flame; color: string; title: string }> = {
  streak_daily: { icon: Flame, color: "#F2754A", title: "Streak Alive!" },
  streak_week: { icon: Flame, color: "#F2754A", title: "7-Day Streak!" },
  streak_month: { icon: Trophy, color: "#FFB347", title: "30-Day Streak!" },
  podium_finish: { icon: Medal, color: "#E3B27B", title: "Podium Finish!" },
  field_leader: { icon: Crown, color: "#FFD37A", title: "Field Leader!" },
};

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

function NotifIcon({ type }: { type: string }) {
  if (type === "match") return <Sparkles className="w-3.5 h-3.5 text-emerald-500" />;
  if (type === "profile_viewed") return <Eye className="w-3.5 h-3.5 text-blue-500" />;
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
  onMarkRead,
  onMarkAllRead,
  onClose,
  anchorRect,
}: {
  notifications: AntylNotification[];
  onMarkRead: (id: string) => void;
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
              onClick={() => !n.is_read && onMarkRead(n.id)}
              className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-0 transition-colors ${
                n.is_read ? "bg-white" : "bg-orange-50/40 hover:bg-orange-50"
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
    if (celebration) handleMarkRead(celebration.id);
    setCelebration(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    window.location.href = "/";
  };

  return (
    <>
      {/* ── Left sidebar (desktop) ── */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-56 bg-white border-r border-gray-100 z-50 px-4 py-6">
        <div className="flex items-center justify-between mb-8 px-3">
          <Link href="/feed" className="flex items-center" aria-label="Home">
            <Image src="/Antyl.png" alt="Antyl logo" width={110} height={30} />
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
            return (
              <Link
                key={href}
                href={href}
                data-tour={tourId}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-colors ${
                  active
                    ? "bg-orange-50 text-[#F2754A]"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-[#F2754A]" : "text-gray-400"}`} />
                {label}
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              href="/admin/weekly-question"
              data-tour="nav-admin"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-colors ${
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
              Admin
            </Link>
          )}
        </nav>

        <button
          type="button"
          onClick={() => setTourActive(true)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold text-gray-400 hover:bg-orange-50 hover:text-[#F2754A] transition-colors w-full text-left"
        >
          <HelpCircle className="w-4 h-4 flex-shrink-0" />
          Take a tour
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors w-full text-left"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Logout
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
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-bold transition-colors ${
                  active ? "text-[#F2754A]" : "text-gray-400"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-[#F2754A]" : "text-gray-400"}`} />
                {label}
              </Link>
            );
          })}
        </div>
      </header>

      <div className="hidden md:block w-56 flex-shrink-0" />

      {/* ── Panel rendered once, fixed-positioned relative to whichever bell was clicked ── */}
      {panelOpen && anchorRect && (
        <NotificationPanel
          notifications={notifications}
          onMarkRead={handleMarkRead}
          onMarkAllRead={handleMarkAllRead}
          onClose={() => setPanelOpen(false)}
          anchorRect={anchorRect}
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