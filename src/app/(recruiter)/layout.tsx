"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
} from "lucide-react";

import { checkIsAdmin } from "@/services/weeklyQuestion.service";
import WeeklyQuestionPopup from "../(developer)/components/WeeklyQuestionPopup";

export default function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  // Admin tab visibility — email whitelist check, backend is the real gate.
  useEffect(() => {
    checkIsAdmin().then(setIsAdmin);
  }, []);

  const menu = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Jobs", href: "/jobs", icon: Briefcase },
  { label: "Create Job", href: "/jobs/new", icon: PlusCircle },
  { label: "Candidates", href: "/candidates", icon: Users },
  { label: "Messages", href: "/recruiter_messages", icon: MessageCircle },
  { label: "Billing", href: "/billing", icon: CreditCard },
  { label: "Kanaban Pipeline", href: "/pipeline", icon: KanbanIcon },
  { label: "Blog", href: "/blog", icon: BookOpen },
  { label: "Profile", href: "/recruiter_profile", icon: CircleUser },
  ...(isAdmin
    ? [{ label: "Admin", href: "/admin/weekly-question", icon: ShieldCheck }]
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
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col p-6">
        <div
          className="text-2xl font-bold mb-10"
          style={{ color: "#F2754A", fontFamily: "var(--font-fraunces, serif)" }}
        >
          Antyl
        </div>

        <nav className="flex flex-col gap-1.5 flex-1">
          {menu.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-colors ${
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
                <Icon className="w-4.5 h-4.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => {
            localStorage.removeItem("access_token");
            window.location.href = "/";
          }}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-colors mt-2"
        >
          <LogOut className="w-4.5 h-4.5" />
          Log out
        </button>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">{children}</main>

      {/* Weekly question popup — checks itself on mount whether there's
          an unanswered question for this recruiter; audience is derived
          server-side from the JWT, no prop needed. */}
      <WeeklyQuestionPopup />
    </div>
  );
}