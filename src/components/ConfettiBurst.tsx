"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ConfettiBurstProps = {
  colors?: string[];
  duration?: number;
  /** Density = particles per 10,000px² of container area. */
  density?: number;
  minParticles?: number;
  maxParticles?: number;
  /** Travel distance as a fraction of the container's smaller dimension. */
  minTravelRatio?: number;
  maxTravelRatio?: number;
  /** Particle size as a fraction of the container's smaller dimension. */
  minSizeRatio?: number;
  maxSizeRatio?: number;
  /** Origin, as a fraction of container width/height (0–1). */
  originX?: number;
  originY?: number;
};

export default function ConfettiBurst({
  colors = ["#F2754A", "#FFB347", "#E3B27B", "#FFD37A", "#1D9E75"],
  duration = 850,
  density = 30,
  minParticles = 12,
  maxParticles = 26,
  minTravelRatio = 0.18,
  maxTravelRatio = 0.4,
  minSizeRatio = 0.03,
  maxSizeRatio = 0.055,
  originX = 0.42,
  originY = 0.42,
}: ConfettiBurstProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      setSize({ w: rect.width, h: rect.height });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const particles = useMemo(() => {
    if (!size || size.w === 0 || size.h === 0) return [];

    const base = Math.min(size.w, size.h);
    const minTravel = base * minTravelRatio;
    const maxTravel = base * maxTravelRatio;
    const minSize = base * minSizeRatio;
    const maxSize = base * maxSizeRatio;

    const area = size.w * size.h;
    const particleCount = Math.round(
      Math.min(maxParticles, Math.max(minParticles, (area / 10000) * density))
    );

    return Array.from({ length: particleCount }, (_, index) => {
      const angle = (Math.PI * 2 * index) / particleCount + (Math.random() - 0.5) * 0.6;
      const travel = minTravel + Math.random() * (maxTravel - minTravel);
      const x = Math.cos(angle) * travel;
      const y = Math.sin(angle) * travel;
      const pSize = minSize + Math.random() * (maxSize - minSize);
      const shape = index % 2 === 0 ? "circle" : "bar";
      const spin = 180 + Math.random() * 360;
      const delay = Math.random() * 0.15;

      return {
        key: index, // stable key — no randomness needed, index is unique per particle
        x,
        y,
        size: pSize,
        shape,
        color: colors[index % colors.length],
        delay,
        spin,
      };
    });
  }, [size, density, minParticles, maxParticles, minTravelRatio, maxTravelRatio, minSizeRatio, maxSizeRatio, colors]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <style>{`
        @keyframes confetti-pop {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.6) rotate(0deg);
          }
          15% {
            opacity: 1;
          }
          65% {
            opacity: 0.9;
          }
          100% {
            opacity: 0;
            transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) rotate(var(--spin));
          }
        }
      `}</style>

      {particles.map((particle) => (
        <span
          key={particle.key}
          className="absolute block"
          style={{
            left: `${originX * 100}%`,
            top: `${originY * 100}%`,
            width: particle.shape === "circle" ? `${particle.size}px` : `${particle.size * 1.7}px`,
            height: particle.shape === "circle" ? `${particle.size}px` : `${particle.size * 0.7}px`,
            background: particle.color,
            borderRadius: "9999px",
            opacity: 0,
            boxShadow: `0 0 3px ${particle.color}`,
            animation: `confetti-pop ${duration}ms cubic-bezier(0.2, 0.7, 0.3, 1) forwards`,
            animationDelay: `${particle.delay}s`,
            transform: "translate(-50%, -50%)",
            ["--dx" as string]: `${particle.x}px`,
            ["--dy" as string]: `${particle.y}px`,
            ["--spin" as string]: `${particle.spin}deg`,
          }}
        />
      ))}
    </div>
  );
}