"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Copy,
  Download,
  Globe,
  MessageCircle,
  Send,
  Share2,
  Sparkles,
  X,
} from "lucide-react";
import ConfettiBurst from "@/components/ConfettiBurst";



export interface ShareBadgeData {
  badgeKey: string;
  label: string;
  description: string;
  image: string;
  color?: string;
  rank?: number | null;
  fieldLabel?: string;
  origin?: {
    x: number;
    y: number;
  } | null;
}

export function ShareBadgeModal({
  badge,
  isOpen,
  onClose,
}: {
  badge: ShareBadgeData | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
    }
  }, [isOpen]);

  const shareText = useMemo(() => {
    if (!badge) return "";
    const rankText = typeof badge.rank === "number" ? ` · Rank #${badge.rank}` : "";
    const fieldText = badge.fieldLabel ? ` · ${badge.fieldLabel}` : "";
    return `${badge.label}${rankText}${fieldText}\n${badge.description}`;
  }, [badge]);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "https://antyl.org";
    return `${window.location.origin}/profile`;
  }, []);

  if (!isOpen || !badge) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch (error) {
      console.error("Failed to copy badge share text", error);
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = badge.image;
    link.download = `${badge.badgeKey || "badge"}.png`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openShareLink = (platform: "linkedin" | "whatsapp" | "instagram") => {
    const encodedText = encodeURIComponent(`${shareText}\n${shareUrl}`);
    const encodedUrl = encodeURIComponent(shareUrl);

    if (platform === "linkedin") {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, "_blank", "noopener,noreferrer");
      return;
    }

    if (platform === "whatsapp") {
      window.open(`https://wa.me/?text=${encodedText}`, "_blank", "noopener,noreferrer");
      return;
    }

    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <style>{`
        @keyframes modal-pop {
          0% {
            opacity: 0;
            transform: translateY(18px) scale(0.94);
          }
          65% {
            opacity: 1;
            transform: translateY(-2px) scale(1.02);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes badge-burst {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.2) rotate(0deg);
          }
          12% {
            opacity: 1;
          }
          60% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty) - 24px)) scale(2.3) rotate(180deg);
          }
        }
      `}</style>

      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative z-40 w-full max-w-md overflow-hidden rounded-[28px] border border-gray-200/80 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.12)]"
        style={{ animation: "modal-pop 320ms cubic-bezier(0.2, 0.8, 0.2, 1)" }}
      >
        <div className="absolute inset-0 z-[200] pointer-events-none">
          <ConfettiBurst  />
        </div>
        <div className="relative z-[1]">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close share badge modal"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="mb-4 rounded-[24px] border border-orange-100 bg-gradient-to-br from-[#fffaf5] via-[#fff5ee] to-[#fff3dd] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_10px_24px_rgba(242,117,74,0.10)]">
            <div className="flex flex-col items-center text-center">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-[26px] border-2 border-white shadow-[0_12px_26px_rgba(242,117,74,0.28)] ring-4 ring-orange-100/90"
                style={{
                  background: badge.color
                    ? `linear-gradient(135deg, ${badge.color}22 0%, ${badge.color}44 100%)`
                    : "linear-gradient(135deg, rgba(242,117,74,0.18), rgba(255,196,86,0.30))",
                  boxShadow: badge.color ? `0 12px 26px ${badge.color}44, 0 0 0 4px ${badge.color}20` : "0 12px 26px rgba(242,117,74,0.28), 0 0 0 4px rgba(242,117,74,0.16)",
                }}
              >
                <img src={badge.image} alt={badge.label} className="h-14 w-14 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)]" />
              </div>

              <div className="mt-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400">Badge</p>
                <h3
                  className="mt-1 bg-gradient-to-r from-[#111827] via-[#374151] to-[#F2754A] bg-clip-text text-[2.1rem] font-black leading-none tracking-[-0.06em] text-transparent"
                  style={{
                    textShadow: "0 2px 10px rgba(242,117,74,0.15)",
                  }}
                >
                  {badge.label}
                </h3>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500">{badge.description}</p>

        {(badge.rank || badge.fieldLabel) && (
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-center text-[11px] font-semibold text-gray-500">
            {typeof badge.rank === "number" && (
              <span className="rounded-full bg-orange-50 px-2 py-1 text-[#F2754A]">Rank #{badge.rank}</span>
            )}
            {badge.fieldLabel && (
              <span className="rounded-full bg-gray-50 px-2 py-1">{badge.fieldLabel}</span>
            )}
          </div>
        )}

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => openShareLink("linkedin")}
            className="flex items-center justify-center gap-2 rounded-2xl border border-gray-100 bg-white px-3 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Globe className="h-4 w-4 text-[#0A66C2]" />
            LinkedIn
          </button>

          <button
            type="button"
            onClick={() => openShareLink("whatsapp")}
            className="flex items-center justify-center gap-2 rounded-2xl border border-gray-100 bg-white px-3 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Send className="h-4 w-4 text-[#25D366]" />
            WhatsApp
          </button>

          <button
            type="button"
            onClick={() => openShareLink("instagram")}
            className="flex items-center justify-center gap-2 rounded-2xl border border-gray-100 bg-white px-3 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Sparkles className="h-4 w-4 text-[#E1306C]" />
            Instagram
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 rounded-2xl border border-gray-100 bg-white px-3 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Download className="h-4 w-4 text-[#F2754A]" />
            Download
          </button>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#F2754A] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#e0623a]"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy link"}
        </button>

          {/* <div className="mt-4 flex items-center gap-2 rounded-2xl bg-gray-50 px-3 py-2">
            <Share2 className="h-4 w-4 text-gray-400" />
            <p className="truncate text-xs text-gray-500">{shareUrl}</p>
          </div> */}
        </div>
      </div>
    </div>
  );
}
