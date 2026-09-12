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
  Menu,
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
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // ── Sidebar collapse — persisted so it survives navigation/reloads.
  // Now honored on every route (not just the dashboard), so the toggle
  // works everywhere.
  const [collapsed, setCollapsed] = useState(false);
  const effectiveCollapsed = collapsed;

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

  // Tracks whether we're below the md breakpoint so mobile-only UI (the
  // new-message toast placement) can react to viewport/orientation
  // changes instead of only checking window.innerWidth once at render.
  useEffect(() => {
    const check = () => setIsMobileViewport(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Close the mobile nav drawer on route change.
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close the mobile nav drawer on outside click.
  useEffect(() => {
    if (!mobileMenuOpen) return;
    function handleClick(e: MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [mobileMenuOpen]);

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

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    window.location.href = "/";
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#FAF6F0]">
      {/* ── Top bar (mobile) ── */}
      <header className="md:hidden bg-white border-b border-gray-100 sticky top-0 z-50 relative shadow-[0_2px_6px_rgba(17,17,17,0.04)]">
        <div className="px-4 sm:px-5 h-[68px] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-shrink-0 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                mobileMenuOpen ? "bg-orange-50 text-[#F2754A]" : "hover:bg-gray-50 text-gray-600"
              }`}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link href="/dashboard" className="flex items-center flex-shrink-0 min-w-0" aria-label="Home">
              <Image
                src="/Antyl.png"
                alt="Antyl logo"
                width={96}
                height={28}
                className="object-contain h-7 w-auto"
              />
            </Link>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="/recruiter_messages"
              aria-label="Messages"
              className="relative w-11 h-11 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center flex-shrink-0 transition-colors"
            >
              <MessageCircle className="w-5 h-5 text-gray-500" />
              {unreadTotal > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[19px] h-[19px] px-1 rounded-full bg-[#F2754A] text-white text-[10px] font-black flex items-center justify-center shadow-sm ring-2 ring-white">
                  {unreadTotal > 9 ? "9+" : unreadTotal}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Logout"
              className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <>
            <div className="fixed inset-0 bg-black/20 z-40" />
            <div
              ref={mobileMenuRef}
              className="absolute left-0 right-0 top-full bg-white border-b border-gray-100 shadow-xl z-50 max-h-[75vh] overflow-y-auto"
            >
              <nav className="flex flex-col py-2.5">
                {menu.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  const isMessages = item.href === "/recruiter_messages";
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3.5 px-5 py-3.5 text-[15px] font-semibold transition-colors ${
                        active ? "bg-orange-50 text-[#F2754A]" : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span className="relative inline-flex">
                        <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${active ? "text-[#F2754A]" : "text-gray-400"}`} />
                        {isMessages && unreadTotal > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#F2754A] text-white text-[9px] font-bold flex items-center justify-center">
                            {unreadTotal > 9 ? "9+" : unreadTotal}
                          </span>
                        )}
                      </span>
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </>
        )}
      </header>

      {/* ── Sidebar (desktop) ── */}
      <aside
        className={`hidden md:flex relative bg-white border-r border-gray-100 flex-col px-4 py-7 flex-shrink-0 transition-all duration-200 ease-in-out ${
          effectiveCollapsed ? "w-24" : "w-64"
        }`}
      >
        {/* Toggle handle — pinned to the sidebar's right edge, vertically
            centered against the logo row. Now shown on every route. */}
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3.5 top-9 w-7 h-7 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 hover:text-[#F2754A] hover:border-[#F2754A] transition-colors z-10"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        <div className={`mb-8 flex items-center ${effectiveCollapsed ? "flex-col gap-4" : "justify-between"}`}>
          <Link href="/dashboard" className="inline-flex items-center" aria-label="Home">
            <Image
              src="/Antyl.png"
              alt="Antyl logo"
              width={effectiveCollapsed ? 36 : 84}
              height={effectiveCollapsed ? 36 : 36}
              className="object-contain"
            />
          </Link>
        </div>

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
                title={effectiveCollapsed ? item.label : undefined}
                className={`relative flex items-center py-3 rounded-2xl text-[15px] font-semibold transition-colors ${
                  effectiveCollapsed ? "justify-center px-0" : "gap-3.5 px-4"
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
                  <Icon className="w-5 h-5" />
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
                {!effectiveCollapsed && item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => setTourActive(true)}
          title={effectiveCollapsed ? "Take a tour" : undefined}
          className={`flex items-center py-3 rounded-2xl text-[15px] font-semibold text-gray-400 hover:bg-orange-50 hover:text-[#F2754A] transition-colors mt-2 ${
            effectiveCollapsed ? "justify-center px-0" : "gap-3.5 px-4"
          }`}
        >
          <HelpCircle className="w-5 h-5" />
          {!effectiveCollapsed && "Take a tour"}
        </button>

        <button
          type="button"
          onClick={handleLogout}
          title={effectiveCollapsed ? "Log out" : undefined}
          className={`flex items-center py-3 rounded-2xl text-[15px] font-semibold text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-colors ${
            effectiveCollapsed ? "justify-center px-0" : "gap-3.5 px-4"
          }`}
        >
          <LogOut className="w-5 h-5" />
          {!effectiveCollapsed && "Log out"}
        </button>
      </aside>

      {/* New-message popup, anchored near the Messages nav icon on desktop,
          full-width above the fold on mobile. Only shows when the recruiter
          isn't already looking at the thread. */}
      {toast && (
        <div
          className={`fixed z-50 w-80 max-w-[calc(100vw-2rem)] animate-in fade-in slide-in-from-left-2 ${
            isMobileViewport
              ? "top-[5.25rem] left-4 right-4 w-auto"
              : `top-6 ${effectiveCollapsed ? "left-28" : "left-[17rem]"}`
          }`}
        >
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex gap-3.5 items-start">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white shadow-sm"
              style={{
                background: "linear-gradient(90deg, #F2754A 0%, #F8B36B 100%)",
              }}
            >
              <MessageCircle className="w-[18px] h-[18px]" />
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
              <p className="text-[13px] text-gray-500 truncate mt-0.5">
                {toast.text}
              </p>
            </button>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-gray-300 hover:text-gray-500 flex-shrink-0 transition-colors"
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