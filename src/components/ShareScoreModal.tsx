"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Download, Globe, Loader2, Send, X } from "lucide-react";
import ConfettiBurst from "@/components/ConfettiBurst";
import { ScoreCardView } from "@/components/ScoreCardView";
import { enableScoreShare, disableScoreShare } from "@/services/developer.service";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "";

export interface ShareScoreData {
  score: number;
  name?: string | null;
  role?: string | null;
  skills?: string[];
}

export function ShareScoreModal({
  data,
  isOpen,
  onClose,
}: {
  data: ShareScoreData | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [slug, setSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<"" | "link" | "caption">("");

  // create/fetch the public slug when the modal opens
  useEffect(() => {
    if (!isOpen) {
      setCopied("");
      setError("");
      return;
    }
    let cancelled = false;
    setLoading(true);
    enableScoreShare()
      .then((s) => !cancelled && setSlug(s))
      .catch((e) => !cancelled && setError(e.message || "Could not create share link"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  if (!isOpen || !data) return null;

  const origin = SITE_URL || (typeof window !== "undefined" ? window.location.origin : "");
  const shareUrl = slug ? `${origin}/share/score/${slug}` : "";
  const imageUrl = slug ? `${shareUrl}/opengraph-image` : "";

  const caption =
    `I just scored ${data.score}/100 on Antyl, verified from my real code and GitHub work.` +
    (data.skills?.length ? `\n\nTop skills: ${data.skills.slice(0, 5).join(", ")}.` : "") +
    `\n\nSee my verified score: ${shareUrl}`;

  const flash = (k: "link" | "caption") => {
    setCopied(k);
    window.setTimeout(() => setCopied(""), 1400);
  };

  const copy = async (text: string, k: "link" | "caption") => {
    try {
      await navigator.clipboard.writeText(text);
      flash(k);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  const shareLinkedIn = () => {
    // Open first (popup blockers), then copy the caption for pasting
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      "_blank",
      "noopener,noreferrer"
    );
    void copy(caption, "caption");
  };

  const shareWhatsApp = () =>
    window.open(`https://wa.me/?text=${encodeURIComponent(caption)}`, "_blank", "noopener,noreferrer");

  const download = async () => {
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "antyl-score.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    } catch (e) {
      console.error("Download failed", e);
    }
  };

  const stopSharing = async () => {
    try {
      await disableScoreShare();
      setSlug(null);
      onClose();
    } catch (e: any) {
      setError(e.message || "Failed to stop sharing");
    }
  };

  const btn =
    "flex items-center justify-center gap-2 rounded-2xl border border-gray-100 bg-white px-3 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-40 max-h-[94vh] w-full max-w-md overflow-y-auto rounded-[28px] border border-gray-200/80 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
        <div className="pointer-events-none absolute inset-0 z-[200]">
          <ConfettiBurst />
        </div>

        <div className="relative z-[1]">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close share score modal"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="mb-4">
            <ScoreCardView
              score={data.score}
              name={data.name}
              role={data.role}
              artMaxWidth={280}
            />
          </div>

          {error && <p className="mb-3 text-center text-xs font-semibold text-red-500">{error}</p>}

          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={shareLinkedIn} disabled={!slug || loading} className={btn}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4 text-[#0A66C2]" />}
              LinkedIn
            </button>
            <button type="button" onClick={shareWhatsApp} disabled={!slug || loading} className={btn}>
              <Send className="h-4 w-4 text-[#25D366]" />
              WhatsApp
            </button>
            <button type="button" onClick={() => copy(caption, "caption")} disabled={!slug} className={btn}>
              {copied === "caption" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4 text-[#F2754A]" />}
              {copied === "caption" ? "Copied" : "Copy caption"}
            </button>
            <button type="button" onClick={download} disabled={!slug} className={btn}>
              <Download className="h-4 w-4 text-[#F2754A]" />
              Download
            </button>
          </div>

          <button
            type="button"
            onClick={() => copy(shareUrl, "link")}
            disabled={!slug}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#F2754A] px-4 py-3 text-sm font-bold text-white hover:bg-[#e0623a] disabled:opacity-50"
          >
            {copied === "link" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied === "link" ? "Copied" : "Copy link"}
          </button>

          <p className="mt-3 text-center text-[11px] text-gray-400">
            Tapping LinkedIn also copies your caption. Paste it into the post box.
          </p>
          {slug && (
            <button
              type="button"
              onClick={stopSharing}
              className="mt-2 block w-full text-center text-[11px] font-semibold text-gray-400 hover:text-red-500"
            >
              Stop sharing this score
            </button>
          )}
        </div>
      </div>
    </div>
  );
}