"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Sparkles, X } from "lucide-react";

export interface TourStep {
  id: string;
  target: string; // CSS selector, e.g. '[data-tour="nav-feed"]'
  title: string;
  content: string;
}

interface OnboardingTourProps {
  steps: TourStep[];
  storageKey: string;
  active: boolean;
  onFinish: () => void;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PADDING = 8;
const CARD_WIDTH = 300;
const CARD_HEIGHT_ESTIMATE = 190;
const GAP = 16;
// How much clearance a target needs from the viewport edges to count as
// "already visible" — leaves room for the tooltip card itself, so we don't
// scroll a target that's technically on-screen but has no room to show its
// card without immediately needing to scroll again.
const VIEWPORT_MARGIN = 100;
// Smooth-scroll settle time before we trust getBoundingClientRect() again.
const SCROLL_SETTLE_MS = 450;

// Spotlight tour only runs on desktop widths — the sidebar (where all
// data-tour targets live) is hidden below md, and the mobile tab bar
// duplicates the same items without unique anchors.
function isDesktopViewport() {
  return typeof window !== "undefined" && window.innerWidth >= 768;
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

function measureTarget(selector: string): Rect | null {
  const el = document.querySelector(selector) as HTMLElement | null;
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return {
    top: r.top - PADDING,
    left: r.left - PADDING,
    width: r.width + PADDING * 2,
    height: r.height + PADDING * 2,
  };
}

function isInViewport(el: HTMLElement): boolean {
  const r = el.getBoundingClientRect();
  return (
    r.top >= VIEWPORT_MARGIN && r.bottom <= window.innerHeight - VIEWPORT_MARGIN
  );
}

export default function OnboardingTour({ steps, storageKey, active, onFinish }: OnboardingTourProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  // Tracks which step index `rect` was measured for, so we can tell a
  // fresh measurement apart from a stale one left over from the last step
  // — without needing a separate "ready" flag that has to be reset.
  const [readyIndex, setReadyIndex] = useState<number | null>(null);

  // Reset to step 0 whenever the tour transitions from inactive → active.
  // Render-time state adjustment (not an effect) — React's recommended
  // pattern for resetting state in response to a prop change, since it
  // happens in the same render pass instead of triggering an extra one.
  // See: https://react.dev/learn/you-might-not-need-an-effect
  const [prevActive, setPrevActive] = useState(active);
  if (active !== prevActive) {
    setPrevActive(active);
    if (active) setStepIndex(0);
  }

  const step = steps[stepIndex];

  const finish = useCallback(() => {
    localStorage.setItem(storageKey, "1");
    onFinish();
  }, [storageKey, onFinish]);

  // Measure target position after mount / step change (small delay lets
  // the page settle first). If the target isn't currently in view, scroll
  // it into view first and wait for that scroll to settle before trusting
  // getBoundingClientRect() — measuring mid-scroll (or pre-scroll) produces
  // an off-screen rect, which renders as a full black backdrop with no
  // visible cutout. Every setState call here happens inside an async
  // callback (the initial setTimeout, or the scroll-settle setTimeout
  // nested inside it) — never synchronously in the effect body itself.
  useEffect(() => {
    if (!active) return;

    let cancelled = false;
    let scrollTimeoutId: ReturnType<typeof setTimeout> | null = null;

    const t = setTimeout(() => {
      if (cancelled) return;

      if (!isDesktopViewport()) {
        // No usable spotlight target on mobile — end the tour instead of
        // showing a broken/empty state.
        finish();
        return;
      }

      const el = document.querySelector(step.target) as HTMLElement | null;

      if (!el) {
        // Target isn't on the page for this user (e.g. admin-only tab) —
        // skip to the next step instead of showing an empty spotlight.
        if (stepIndex >= steps.length - 1) {
          finish();
        } else {
          setStepIndex((i) => i + 1);
        }
        return;
      }

      const finalize = () => {
        if (cancelled) return;
        const measured = measureTarget(step.target);
        if (!measured) {
          finish();
          return;
        }
        setRect(measured);
        setReadyIndex(stepIndex);
      };

      if (isInViewport(el)) {
        finalize();
      } else {
        el.scrollIntoView({
          behavior: prefersReducedMotion() ? "auto" : "smooth",
          block: "center",
        });
        scrollTimeoutId = setTimeout(finalize, SCROLL_SETTLE_MS);
      }
    }, 50);

    return () => {
      cancelled = true;
      clearTimeout(t);
      if (scrollTimeoutId) clearTimeout(scrollTimeoutId);
    };
  }, [active, stepIndex, step, steps.length, finish]);

  // Re-measure on resize while a step is already showing. The setState
  // call lives inside the event-listener callback (the "subscribe to an
  // external system, setState in its callback" pattern the rule wants),
  // not in the effect body.
  useEffect(() => {
    if (!active) return;

    function handleResize() {
      if (!isDesktopViewport()) return;
      const measured = measureTarget(step.target);
      if (measured) setRect(measured);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [active, step]);

  const ready = readyIndex === stepIndex;

  if (!active || !step || !ready || !rect) return null;

  const next = () => {
    if (stepIndex === steps.length - 1) {
      finish();
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  const back = () => setStepIndex((i) => Math.max(0, i - 1));

  let cardTop = rect.top + rect.height + GAP;
  if (cardTop + CARD_HEIGHT_ESTIMATE > window.innerHeight - 12) {
    cardTop = Math.max(rect.top - CARD_HEIGHT_ESTIMATE - GAP, 12);
  }
  const cardLeft = Math.min(Math.max(rect.left, 12), window.innerWidth - CARD_WIDTH - 12);

  return (
    <div className="fixed inset-0 z-[200]">
      {/* Dimmed backdrop with a cutout over the target */}
      <div
        className="absolute rounded-2xl transition-all duration-300 ease-out"
        style={{
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          boxShadow: "0 0 0 9999px rgba(15, 15, 15, 0.65)",
          pointerEvents: "none",
        }}
      />

      {/* Tooltip card */}
      <div
        className="absolute bg-white rounded-[20px] shadow-2xl p-5 transition-all duration-300 ease-out"
        style={{ top: cardTop, left: cardLeft, width: CARD_WIDTH }}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-[#F2754A]" />
          </div>
          <button
            type="button"
            onClick={finish}
            className="w-6 h-6 rounded-full hover:bg-gray-100 flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>

        <h3 className="text-sm font-bold text-gray-900 mb-1">{step.title}</h3>
        <p className="text-xs text-gray-500 leading-relaxed mb-4">{step.content}</p>

        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {steps.map((s, i) => (
              <span
                key={s.id}
                className={`h-1.5 rounded-full transition-all ${
                  i === stepIndex ? "w-4 bg-[#F2754A]" : "w-1.5 bg-gray-200"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {stepIndex > 0 && (
              <button
                type="button"
                onClick={back}
                className="w-7 h-7 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-gray-500" />
              </button>
            )}
            <button
              type="button"
              onClick={next}
              className="flex items-center gap-1 px-3.5 py-2 rounded-full text-xs font-bold text-white bg-[#F2754A] hover:bg-[#e0623a] transition-colors"
            >
              {stepIndex === steps.length - 1 ? "Done" : "Next"}
              {stepIndex < steps.length - 1 && <ArrowRight className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}