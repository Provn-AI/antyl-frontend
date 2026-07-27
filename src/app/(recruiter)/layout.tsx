"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  Briefcase,
  PlusCircle,
  Users,
  CreditCard,
  LogOut,
  KanbanIcon,
  CircleUser,
  MessageCircle,
  BookOpen,
  ShieldCheck,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import { checkIsAdmin } from "@/services/weeklyQuestion.service";
import { getConversations, Conversation } from "@/services/message.service";
import WeeklyQuestionPopup from "../(developer)/components/WeeklyQuestionPopup";
import OnboardingTour from "@/components/OnboardingTour";
import { recruiterTourSteps, RECRUITER_TOUR_KEY } from "@/lib/tourSteps";

type NewMessageToast = {
  key: string;
  match_id: string;
  name: string;
  text: string;
};

const SIDEBAR_COLLAPSE_KEY = "antyl_recruiter_nav_collapsed";

export default function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [tourActive, setTourActive] = useState(false);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [toast, setToast] = useState<NewMessageToast | null>(null);

  // ── Sidebar collapse — persisted so it survives navigation/reloads ──
  const [collapsed, setCollapsed] = useState(false);

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

  // match_id -> last seen message id, so polling only fires a popup for
  // messages that are actually new, not on every refresh.
  const lastSeenRef = useRef<Record<string, string | null>>({});
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onMessagesPage = pathname.startsWith("/recruiter_messages");

  // Admin tab visibility — email whitelist check, backend is the real gate.
  useEffect(() => {
    checkIsAdmin().then(setIsAdmin);
  }, []);

  // First-login onboarding tour — desktop only, since the sidebar (where
  // every data-tour anchor lives) is hidden below md.
  useEffect(() => {
    if (window.innerWidth < 768) return;
    if (!localStorage.getItem(RECRUITER_TOUR_KEY)) {
      const t = setTimeout(() => setTourActive(true), 500);
      return () => clearTimeout(t);
    }
  }, []);

  // Site-wide unread badge + new-message popup for the Messages nav icon.
  // Lives here (not just on the messages page) so it works no matter
  // which recruiter page you're on.
  useEffect(() => {
    let active = true;

    async function poll(isFirstLoad: boolean) {
      try {
        const data: Conversation[] = await getConversations();
        if (!active) return;

        setUnreadTotal(data.reduce((sum, c) => sum + (c.unread_count || 0), 0));

        const seenBefore = lastSeenRef.current;
        const nextSeen: Record<string, string | null> = {};

        for (const conv of data) {
          const newLastId = conv.last_message?.id ?? null;
          nextSeen[conv.match_id] = newLastId;

          if (isFirstLoad) continue; // don't pop a toast for pre-existing messages on mount

          const prevLastId = seenBefore[conv.match_id];
          const isNew = newLastId !== null && newLastId !== prevLastId;
          const isIncoming = conv.last_message?.sender_role !== "recruiter";

          // Don't pop the toast while already sitting in that thread.
          if (isNew && isIncoming && !onMessagesPage) {
            setToast({
              key: newLastId as string,
              match_id: conv.match_id,
              name: conv.other_party.name || "Candidate",
              text: conv.last_message?.content ?? "",
            });
            if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
            toastTimerRef.current = setTimeout(() => setToast(null), 6000);
          }
        }

        lastSeenRef.current = nextSeen;
      } catch (err) {
        console.error(err);
      }
    }

    poll(true);
    const interval = setInterval(() => poll(false), 20000);

    return () => {
      active = false;
      clearInterval(interval);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [onMessagesPage]);

  const menu = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, tourId: "nav-dashboard" },
    { label: "Jobs", href: "/jobs", icon: Briefcase, tourId: "nav-jobs" },
    { label: "Create Job", href: "/jobs/new", icon: PlusCircle, tourId: "nav-jobs-new" },
    { label: "Candidates", href: "/candidates", icon: Users, tourId: "nav-candidates" },
    { label: "Messages", href: "/recruiter_messages", icon: MessageCircle, tourId: "nav-messages" },
    { label: "Billing", href: "/billing", icon: CreditCard, tourId: "nav-billing" },
    { label: "Kanaban Pipeline", href: "/pipeline", icon: KanbanIcon, tourId: "nav-pipeline" },
    { label: "Blog", href: "/recruiter_blog", icon: BookOpen, tourId: "nav-blog" },
    { label: "Profile", href: "/recruiter_profile", icon: CircleUser, tourId: "nav-profile" },
    ...(isAdmin
      ? [{ label: "Admin", href: "/admin/weekly-question", icon: ShieldCheck, tourId: "nav-admin" }]
      : []),
  ];

  const isActive = (href: string) => {
    if (href === "/jobs") {
      // Only exact match for the Jobs list — don't light up "Jobs"
      // when on "/jobs/new" or "/jobs/[id]", since those have their
      // own distinct nav items / aren't in this list.
      return pathname === "/jobs";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="flex min-h-screen bg-[#FAF6F0]">
      {/* Sidebar */}
      <aside
        className={`bg-white border-r border-gray-100 flex flex-col p-6 flex-shrink-0 transition-all duration-200 ease-in-out ${
          collapsed ? "w-24" : "w-64"
        }`}
      >
        <div className={`mb-2 flex items-center ${collapsed ? "flex-col gap-3" : "justify-between"}`}>
          <Link href="/dashboard" className="inline-flex items-center" aria-label="Home">
            <Image
              src="/Antyl.png"
              alt="Antyl logo"
              width={collapsed ? 30 : 70}
              height={collapsed ? 30 : 30}
              className="object-contain"
            />
          </Link>
        </div>

        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex items-center justify-center w-full py-1.5 mb-6 rounded-xl text-gray-300 hover:text-gray-500 hover:bg-gray-50 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        <nav className="flex flex-col gap-1.5 flex-1">
          {menu.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const isMessages = item.href === "/recruiter_messages";

            return (
              <Link
                key={item.href}
                href={item.href}
                data-tour={item.tourId}
                title={collapsed ? item.label : undefined}
                className={`relative flex items-center py-3 rounded-2xl text-sm font-semibold transition-colors ${
                  collapsed ? "justify-center px-0" : "gap-3 px-4"
                } ${
                  active
                    ? "text-white"
                    : "text-gray-500 hover:bg-orange-50 hover:text-[#F2754A]"
                }`}
                style={
                  active
                    ? {
                        background:
                          "linear-gradient(90deg, #F2754A 0%, #F8B36B 100%)",
                      }
                    : undefined
                }
              >
                <span className="relative inline-flex">
                  <Icon className="w-4.5 h-4.5" />
                  {isMessages && unreadTotal > 0 && (
                    <span
                      className={`absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] px-1 rounded-full text-[9px] font-bold flex items-center justify-center ${
                        active
                          ? "bg-white text-[#F2754A]"
                          : "bg-[#F2754A] text-white"
                      }`}
                    >
                      {unreadTotal > 9 ? "9+" : unreadTotal}
                    </span>
                  )}
                </span>
                {!collapsed && item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => setTourActive(true)}
          title={collapsed ? "Take a tour" : undefined}
          className={`flex items-center py-3 rounded-2xl text-sm font-semibold text-gray-400 hover:bg-orange-50 hover:text-[#F2754A] transition-colors mt-2 ${
            collapsed ? "justify-center px-0" : "gap-3 px-4"
          }`}
        >
          <HelpCircle className="w-4.5 h-4.5" />
          {!collapsed && "Take a tour"}
        </button>

        <button
          type="button"
          onClick={() => {
            localStorage.removeItem("access_token");
            window.location.href = "/";
          }}
          title={collapsed ? "Log out" : undefined}
          className={`flex items-center py-3 rounded-2xl text-sm font-semibold text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-colors ${
            collapsed ? "justify-center px-0" : "gap-3 px-4"
          }`}
        >
          <LogOut className="w-4.5 h-4.5" />
          {!collapsed && "Log out"}
        </button>
      </aside>

      {/* New-message popup, anchored near the Messages nav icon. Only
          shows when the recruiter isn't already looking at the thread. */}
      {toast && (
        <div
          className={`fixed top-6 z-50 w-80 animate-in fade-in slide-in-from-left-2 ${
            collapsed ? "left-28" : "left-[17rem]"
          }`}
        >
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 flex gap-3 items-start">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white"
              style={{
                background: "linear-gradient(90deg, #F2754A 0%, #F8B36B 100%)",
              }}
            >
              <MessageCircle className="w-4 h-4" />
            </div>
            <button
              type="button"
              onClick={() => {
                setToast(null);
                router.push("/recruiter_messages");
              }}
              className="flex-1 text-left min-w-0"
            >
              <p className="text-sm font-bold text-gray-900 truncate">
                New message from {toast.name}
              </p>
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {toast.text}
              </p>
            </button>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-gray-300 hover:text-gray-500 flex-shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 overflow-auto">{children}</main>

      {/* Weekly question popup — checks itself on mount whether there's
          an unanswered question for this recruiter; audience is derived
          server-side from the JWT, no prop needed. */}
      <WeeklyQuestionPopup />

      {/* First-login onboarding tour — desktop only, replayable via the
          "Take a tour" sidebar button. */}
      <OnboardingTour
        steps={recruiterTourSteps}
        storageKey={RECRUITER_TOUR_KEY}
        active={tourActive}
        onFinish={() => setTourActive(false)}
      />
    </div>
  );
}