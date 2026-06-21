"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, FileText, User, LogOut } from "lucide-react";

const TABS = [
  { label: "Feed",         href: "/feed",         icon: LayoutGrid },
  { label: "Applications", href: "/applications",  icon: FileText   },
  { label: "Profile",      href: "/profile",       icon: User       },
];

export default function DeveloperNavbar() {
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    window.location.href = "/login";
  };

  return (
    <>
      {/* ── Left sidebar (desktop) ── */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-56 bg-white border-r border-gray-100 z-50 px-4 py-6">
        {/* Logo */}
        <Link
          href="/feed"
          className="text-xl font-bold mb-8 px-3"
          style={{ color: "#F2754A", fontFamily: "var(--font-fraunces, serif)" }}
        >
          Antyl
        </Link>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 flex-1">
          {TABS.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
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
        </nav>

        {/* Logout at bottom */}
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
          <Link
            href="/feed"
            className="text-xl font-bold"
            style={{ color: "#F2754A", fontFamily: "var(--font-fraunces, serif)" }}
          >
            Antyl
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 px-3 py-1.5 rounded-full transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>

        {/* Mobile bottom tab bar */}
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

      {/* ── Sidebar spacer so page content doesn't go under the sidebar ── */}
      <div className="hidden md:block w-56 flex-shrink-0" />
    </>
  );
}