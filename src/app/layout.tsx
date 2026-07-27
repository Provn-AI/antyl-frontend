import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

import Navbar from "@/components/Navbar";

// metadataBase is required for Next.js to resolve relative OG/Twitter image
// URLs into absolute ones. Without it, link-preview crawlers (Slack,
// Notion, LinkedIn, etc.) sometimes fail to fetch the image/icon at all.
export const metadata: Metadata = {
  metadataBase: new URL("https://antyl.org"),
  title: "Antyl - Turn Time into Opportunities",
  description: "AI-powered developer verification and smart job matching.",

  // NOTE: app/favicon.ico is already picked up automatically by Next.js
  // (file-based convention) — no need to declare it here. The entries
  // below are extra: a PNG fallback (Google Search + most link-preview
  // crawlers don't reliably read SVG favicons) and an Apple touch icon,
  // both reusing the existing public/Antyl.png rather than new files.
  icons: {
    icon: [{ url: "/Antyl.png", type: "image/png" }],
    shortcut: "/favicon.ico",
    apple: "/Antyl.png",
  },

  openGraph: {
    title: "Antyl - Turn Time into Opportunities",
    description:
      "Antyl verifies developers with AI, then auto-applies you to matching roles. No ghosting, no guessing - just your next job.",
    url: "https://antyl.org",
    siteName: "Antyl",
    // Reusing the existing logo as the OG image. It'll work for
    // favicon-style link-preview cards (like the one in your screenshot),
    // but if you ever want the big banner-style preview (LinkedIn,
    // Twitter/X, iMessage), that needs a proper 1200x630 image — Antyl.png
    // being square will just get letterboxed/cropped in those contexts.
    images: ["/Antyl.png"],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Antyl - Turn Time into Opportunities",
    description:
      "Antyl verifies developers with AI, then auto-applies you to matching roles.",
    images: ["/Antyl.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}