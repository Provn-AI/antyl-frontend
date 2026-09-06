"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { Building2, Crosshair, UserRoundCheck } from "lucide-react";

function useLazySection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

// ─── This is the DEVELOPER landing page (root "/"). ───
// The recruiter counterpart lives at "/recruiters" (see recruiters/page.tsx).
export default function DeveloperLandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [counted, setCounted] = useState(false);
  const [counts, setCounts] = useState({ devs: 0, companies: 0, match: 0 });
  const statsRef = useRef<HTMLDivElement>(null);

  const lazyHero = useLazySection();
  const lazyHowItWorks = useLazySection();
  const lazyStats = useLazySection();
  const lazyTech = useLazySection();
  const lazyProof = useLazySection();
  const lazyScore = useLazySection();
  const [scoreCount, setScoreCount] = useState(0);
  const lazyFeatures = useLazySection();
  const lazyTestimonials = useLazySection();
  const lazyDualCta = useLazySection();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const animateCount = (
    key: "devs" | "companies" | "match",
    from: number,
    to: number,
    duration: number
  ) => {
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCounts((prev) => ({ ...prev, [key]: Math.floor(from + (to - from) * ease) }));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted) {
          setCounted(true);
          animateCount("devs", 0, 50, 1400);
          animateCount("companies", 0, 10, 1200);
          animateCount("match", 0, 92, 1000);
        }
      },
      { threshold: 0, rootMargin: "0px 0px -100px 0px" }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [counted]);

  // Developer-only 4-step flow
  const steps = [
    {
      num: "01",
      title: "Connect GitHub",
      desc: "Link your repos. Antyl's AI reads your actual code and your resume.",
      color: "#FF6B4D",
      bg: "#FFF0ED",
    },
    {
      num: "02",
      title: "Get verified",
      desc: "Answer 7 questions about your own projects. Takes 5 minutes.",
      color: "#FFB347",
      bg: "#FFF8ED",
    },
    {
      num: "03",
      title: "Set preferences",
      desc: "Choose role, location, salary and skills. That's it.",
      color: "#FFD84D",
      bg: "#FFFBEE",
    },
    {
      num: "04",
      title: "Auto-apply runs for you",
      desc: "Every 6 hours, Antyl finds matching jobs and applies for you. Less applying. More interviews.",
      color: "#FF7A8A",
      bg: "#FFF0F2",
    },
  ];

  // Developer-only testimonials
  const testimonials = [
    {
      quote:
        "I got 3 interview calls in the first week without applying to a single job manually.",
      name: "A. Singh",
      role: "Frontend Engineer · Hired at Razorpay",
      initials: "AS",
      score: 88,
      tier: "Expert",
    },
    {
      quote:
        "Finally a platform that proves my skills without a whiteboard test. My score opened doors I couldn't before.",
      name: "Priya Sharma",
      role: "Full-Stack Dev · Hired at PhonePe",
      initials: "PS",
      score: 79,
      tier: "Advanced",
    },
    {
      quote:
        "Auto-apply saved me hours every week. Woke up one morning with 2 interview requests waiting.",
      name: "Rahul M.",
      role: "Backend Engineer · Hired at Swiggy",
      initials: "RM",
      score: 91,
      tier: "Expert",
    },
  ];

  const logos: Record<string, React.ReactElement> = {
    nextjs: (
      <svg width="28" height="28" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
        <mask id="nxt-m" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="0" y="0" width="180" height="180">
          <circle cx="90" cy="90" r="90" fill="black" />
        </mask>
        <g mask="url(#nxt-m)">
          <circle cx="90" cy="90" r="90" fill="black" />
          <path d="M149.508 157.52L69.142 54H54V125.97H66.12V69.38L140 164.845C143.333 162.614 146.51 160.165 149.508 157.52Z" fill="url(#nxt-g1)" />
          <rect x="115" y="54" width="12" height="72" fill="url(#nxt-g2)" />
        </g>
        <defs>
          <linearGradient id="nxt-g1" x1="109" y1="116.5" x2="144.5" y2="160.5" gradientUnits="userSpaceOnUse">
            <stop stopColor="white" /><stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="nxt-g2" x1="121" y1="54" x2="120.8" y2="106.875" gradientUnits="userSpaceOnUse">
            <stop stopColor="white" /><stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    ),
    nodejs: (
      <svg width="28" height="32" viewBox="0 0 256 289" xmlns="http://www.w3.org/2000/svg">
        <path fill="#539E43" d="M128 288.5c-4 0-7.7-1.1-11.1-2.9l-35.3-20.9c-5.3-3-2.7-4-1-4.7 7.2-2.4 8.6-3 16.2-7.2.8-.4 1.9-.3 2.7.2l27.1 16.1c1.1.6 2.5.6 3.4 0l105.8-61.1c1.1-.6 1.8-1.9 1.8-3.1V83c0-1.3-.7-2.5-1.8-3.2L130.4 18.7c-1.1-.6-2.5-.6-3.4 0L21.3 79.8c-1.1.6-1.8 1.9-1.8 3.2v122.1c0 1.2.7 2.5 1.8 3.1l29 16.8c15.8 7.9 25.4-1.4 25.4-10.8V93.4c0-1.7 1.3-2.9 2.9-2.9h12.8c1.7 0 2.9 1.3 2.9 2.9v120.8c0 21-11.5 33.2-31.4 33.2-6.1 0-10.9 0-24.5-6.6l-27.9-16C4.4 220.5 0 212.9 0 204.8V82.7C0 74.5 4.4 67 11.6 63L117.4 1.9c7-4 16.3-4 23.2 0L246.4 62.9C253.6 67 258 74.5 258 82.7v122.1c0 8.1-4.4 15.7-11.6 19.7L140.6 285.5c-3.4 1.9-7.1 2.9-11.1 2.9h-1.5z"/>
      </svg>
    ),
    php: (
      <svg width="32" height="18" viewBox="0 0 256 92" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="128" cy="46" rx="128" ry="46" fill="#8892BF"/>
        <path fill="#fff" d="M35.88 22h18.8l-3.1 16h9.4c8.8 0 14.8 1.8 18 5.4 3 3.4 3.8 8.4 2.4 15-1.5 7.2-4.6 12.7-9.2 16.4-4.6 3.7-10.8 5.5-18.8 5.5H30L35.88 22zM52 64.5h6.7c3.4 0 5.9-.7 7.5-2.2 1.5-1.4 2.7-3.9 3.4-7.3.6-3.2.3-5.4-.9-6.6-1.2-1.2-3.7-1.8-7.5-1.8H55L52 64.5z"/>
        <path fill="#fff" d="M89.1 22h18.8l-3.1 16h9.4c8.8 0 14.8 1.8 18 5.4 3 3.4 3.8 8.4 2.4 15-1.5 7.2-4.6 12.7-9.2 16.4-4.6 3.7-10.8 5.5-18.8 5.5H83.2L89.1 22zM105.3 64.5H112c3.4 0 5.9-.7 7.5-2.2 1.5-1.4 2.7-3.9 3.4-7.3.6-3.2.3-5.4-.9-6.6-1.2-1.2-3.7-1.8-7.5-1.8h-6.2l-3 15.9z"/>
        <path fill="#fff" d="M145.3 22h18.5l-1.9 10h9.7c6.6 0 11.1 1.4 13.5 4.2 2.4 2.8 2.9 7 1.4 12.6l-5.5 26.8h-18.8l5.2-25.3c.6-2.8.4-4.6-.5-5.5-.9-.9-2.9-1.3-6-1.3h-7.8l-6.5 32.1h-18.5L145.3 22z"/>
      </svg>
    ),
    git: (
      <svg width="28" height="28" viewBox="0 0 92 92" xmlns="http://www.w3.org/2000/svg">
        <path fill="#F05133" d="M90.156 41.965L50.036 1.848a5.912 5.912 0 0 0-8.364 0l-8.33 8.33 10.566 10.566a7.03 7.03 0 0 1 7.23 1.684 7.043 7.043 0 0 1 1.673 7.277l10.183 10.184a7.026 7.026 0 0 1 7.278 1.672 7.04 7.04 0 0 1 0 9.957 7.045 7.045 0 0 1-9.961 0 7.038 7.038 0 0 1-1.532-7.66l-9.5-9.497V59.36a7.04 7.04 0 0 1 1.86 11.29 7.04 7.04 0 0 1-9.957 0 7.04 7.04 0 0 1 0-9.958 7.034 7.034 0 0 1 2.308-1.539V33.926a7.001 7.001 0 0 1-2.308-1.535 7.049 7.049 0 0 1-1.516-7.698L29.242 14.126 1.734 41.633a5.918 5.918 0 0 0 0 8.367l40.12 40.116a5.908 5.908 0 0 0 8.364 0l39.938-39.938a5.92 5.92 0 0 0 0-8.213"/>
      </svg>
    ),
    typescript: (
      <svg width="28" height="28" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
        <rect width="256" height="256" rx="20" fill="#3178C6"/>
        <path fill="#fff" d="M150.518 200.475v27.62c4.492 2.302 9.805 4.028 15.938 5.179 6.133 1.151 12.597 1.726 19.393 1.726 6.622 0 12.914-.633 18.874-1.899 5.96-1.266 11.187-3.352 15.678-6.257 4.492-2.906 8.048-6.704 10.669-11.394 2.62-4.689 3.93-10.486 3.93-17.391 0-5.006-.749-9.394-2.246-13.163a30.748 30.748 0 0 0-6.479-10.055c-2.821-2.935-6.205-5.567-10.149-7.898-3.945-2.33-8.394-4.531-13.347-6.602-3.628-1.497-6.881-2.949-9.761-4.354-2.879-1.405-5.327-2.839-7.342-4.303-2.016-1.463-3.571-3.025-4.665-4.686-1.094-1.66-1.641-3.564-1.641-5.712 0-1.956.489-3.717 1.468-5.282.979-1.565 2.362-2.921 4.151-4.067 1.79-1.146 3.945-2.043 6.465-2.691 2.52-.647 5.327-.971 8.421-.971 2.248 0 4.581.158 6.999.475 2.418.317 4.836.793 7.255 1.429 2.419.636 4.75 1.457 6.998 2.462a33.256 33.256 0 0 1 6.134 3.633v-25.772c-4.09-1.566-8.584-2.717-13.482-3.452-4.899-.734-10.524-1.101-16.876-1.101-6.564 0-12.798.705-18.703 2.117-5.904 1.411-11.1 3.591-15.591 6.539-4.492 2.949-8.048 6.776-10.668 11.483-2.622 4.707-3.932 10.317-3.932 16.83 0 8.326 2.417 15.48 7.253 21.459 4.836 5.979 12.088 11.101 21.755 15.366 3.802 1.566 7.3 3.103 10.493 4.611 3.194 1.509 5.96 3.048 8.3 4.615 2.34 1.568 4.177 3.265 5.511 5.092 1.334 1.827 2.001 3.923 2.001 6.291 0 1.899-.404 3.659-1.211 5.282-.807 1.622-2.076 3.03-3.807 4.22-1.732 1.19-3.917 2.131-6.552 2.823-2.636.692-5.731 1.038-9.282 1.038-6.075 0-12.149-1.066-18.223-3.198-6.074-2.132-11.631-5.335-16.67-9.608zm-46.139-91.91H140.65v-23.675H41v23.675h35.345V233h28.034V108.565z"/>
      </svg>
    ),
    tailwind: (
      <svg width="28" height="18" viewBox="0 0 54 33" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M27 0C19.8 0 15.3 3.6 13.5 10.8c2.7-3.6 5.85-4.95 9.45-4.05 2.054.514 3.522 2.004 5.147 3.653C30.744 13.09 33.808 16.2 40.5 16.2c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.514-3.522-2.004-5.147-3.653C36.756 3.11 33.692 0 27 0zM13.5 16.2C6.3 16.2 1.8 19.8 0 27c2.7-3.6 5.85-4.95 9.45-4.05 2.054.514 3.522 2.004 5.147 3.653C17.244 29.29 20.308 32.4 27 32.4c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.514-3.522-2.004-5.147-3.653C23.256 19.31 20.192 16.2 13.5 16.2z" fill="#38BDF8"/>
      </svg>
    ),
    sqlite: (
      <svg width="28" height="28" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path fill="#0F7ACF" d="M79.998 1.428c-8.23 1.39-20.007 15.145-21.876 26.576-.944 5.754.586 10.157 4.514 12.847l1.97 1.315-1.126 1.386c-3.437 4.228-4.565 8.818-3.51 14.296 1.05 5.434.19 9.08-2.824 11.916-1.506 1.413-3.527 2.458-6.617 3.412l-2.047.63 1.25 2.1c4.41 7.406 3.843 15.668-1.496 21.615-2.24 2.49-2.024 2.475 3.97.278 17.484-6.37 34.267-22.015 42.097-39.68 4.15-9.418 5.407-18.61 3.695-26.97-1.575-7.696-5.37-12.787-11.26-15.01l-2.378-.9.784-1.52c2.023-3.93 2.652-8.918 1.718-13.647l-.518-2.643-1.346 2.199z"/>
        <path fill="#003B57" d="M32.067 10.172c-12.22 1.57-22.698 10.47-26.52 22.62-1.294 4.1-1.444 11.196-.338 15.6 2.4 9.6 10.07 17.836 20.028 21.574l2.37.895-.595 2.014c-1.83 6.19-1.41 13.4 1.14 19.83.83 2.1 1.61 3.63 1.74 3.4.12-.22-.11-1.9-.51-3.72-1.24-5.56-.31-12.3 2.44-17.57l1.43-2.74-2.18-1.16c-8.12-4.33-12.83-12.09-12.83-21.12 0-8.27 3.81-15.02 11.05-19.58 3.45-2.17 9.36-3.97 13.74-4.17 2.11-.1 2.2-.14 1.56-.72-3.39-3.1-5.42-7.63-5.67-12.61l-.13-2.58-2.44.31z"/>
      </svg>
    ),
    angular: (
      <svg width="28" height="28" viewBox="0 0 250 250" xmlns="http://www.w3.org/2000/svg">
        <path fill="#DD0031" d="M125 30L31.9 63.2l14.2 123.1L125 230l78.9-43.7 14.2-123.1z"/>
        <path fill="#C3002F" d="M125 30v22.2-.1V230l78.9-43.7 14.2-123.1L125 30z"/>
        <path fill="#fff" d="M125 52.1L66.8 182.6h21.7l11.7-29.2h49.4l11.7 29.2H183L125 52.1zm17 83.3h-34l17-40.9 17 40.9z"/>
      </svg>
    ),
    sql: (
      <svg width="28" height="28" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="50" cy="25" rx="38" ry="12" fill="#00758F"/>
        <path fill="#00758F" d="M12 25v15c0 6.627 17.013 12 38 12s38-5.373 38-12V25c0 6.627-17.013 12-38 12S12 31.627 12 25z"/>
        <path fill="#F29111" d="M12 40v15c0 6.627 17.013 12 38 12s38-5.373 38-12V40c0 6.627-17.013 12-38 12S12 46.627 12 40z"/>
        <path fill="#00758F" d="M12 55v15c0 6.627 17.013 12 38 12s38-5.373 38-12V55c0 6.627-17.013 12-38 12S12 61.627 12 55z"/>
      </svg>
    ),
  };

  const carouselSkills = [
    { key: "nextjs",      name: "Next.js" },
    { key: "nodejs",      name: "Node.js" },
    { key: "php",         name: "PHP" },
    { key: "git",         name: "Git" },
    { key: "sql",         name: "MySQL" },
    { key: "tailwind",    name: "Tailwind CSS" },
    { key: "typescript",  name: "TypeScript" },
    { key: "sqlite",      name: "SQLite" },
    { key: "angular",     name: "Angular" },
  ];

  // Developer-only testimonials for the marquee
  const carouselTestimonials = [
    {
      quote: "Got 3 interview calls in the first week - without applying to a single job manually.",
      name: "Vanshika K.",
      role: "Frontend Engineer",
      company: "Razorpay",
      initials: "VK",
      score: 88,
      tier: "Expert",
      bg: "#FFE8E3",
      color: "#FF6B4D",
      photo: "/Girl.jpeg",
    },
    {
      quote: "Antyl proved my skills without a whiteboard test. My score opened doors I couldn't before.",
      name: "Priya S.",
      role: "Full-Stack Dev",
      company: "PhonePe",
      initials: "PS",
      score: 79,
      tier: "Advanced",
      bg: "#FFF4E3",
      color: "#FFB347",
      photo: "/girl2.jpeg",
    },
    {
      quote: "Auto-apply saved me hours every week. Woke up one morning with 2 interview requests waiting.",
      name: "Rahul M.",
      role: "Backend Engineer",
      company: "Swiggy",
      initials: "RM",
      score: 91,
      tier: "Expert",
      bg: "#EAFAF0",
      color: "#22C55E",
      photo: "/Boy.jpeg",
    },
    {
      quote: "I was skeptical, but the AI verification session actually asked smart questions about my own code.",
      name: "Dev P.",
      role: "DevOps Engineer",
      company: "CRED",
      initials: "DP",
      score: 83,
      tier: "Advanced",
      bg: "#E6F4FF",
      color: "#3B82F6",
      photo: "/boy2.jpeg",
    },
  ];

  // Animate score number when section becomes visible (re-triggers on scroll)
  useEffect(() => {
    if (lazyScore.visible) {
      const target = 78;
      const duration = 1800;
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        setScoreCount(Math.floor(target * ease));
        if (progress < 1) requestAnimationFrame(tick);
        else setScoreCount(target);
      };
      requestAnimationFrame(tick);
    } else {
      setScoreCount(0);
    }
  }, [lazyScore.visible]);

  const scoreDimensions = [
    { label: "Technical depth", value: 82 },
    { label: "Code quality", value: 74 },
    { label: "Project complexity", value: 80 },
    { label: "Communication", value: 68 },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,600&display=swap');

        :root {
          --coral: #FF6B4D;
          --amber: #FFB347;
          --lemon: #FFD84D;
          --pink: #FF7A8A;
          --cream: #FFF6EE;
          --beige: #FDE9D2;
          --ink: #1A1A1A;
          --white: #FFFFFF;
          --gray1: #F8F5F0;
          --gray2: #E8E4DF;
          --gray3: #B0A89E;
          --gray4: #6B6560;
          --grad: linear-gradient(135deg, #FF6B4D, #FFB347, #FFD84D);
          --grad-90: linear-gradient(90deg, #FF6B4D, #FFB347);
          --font: 'DM Sans', sans-serif;
          --serif: 'Fraunces', serif;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        html { scroll-behavior: smooth; }

        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
          * { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important; }
        }

        body {
          font-family: var(--font);
          background: #FFF8ED;
          color: var(--ink);
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }

        .page-gradient {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background:
            radial-gradient(circle at 0% 8%, rgba(255, 107, 77, .055), transparent 30%),
            radial-gradient(circle at 100% 12%, rgba(255, 216, 77, .065), transparent 28%),
            radial-gradient(circle at 52% 46%, rgba(255, 179, 71, .04), transparent 25%);
        }

        a:focus-visible, button:focus-visible {
          outline: 2px solid var(--coral);
          outline-offset: 3px;
          border-radius: 4px;
        }

        /* ---- LAZY LOADING & RE-TRIGGERING SCROLL ANIMATIONS ---- */
        .lazy-section {
          opacity: 0;
          transform: translateY(40px) scale(0.98);
          transition: opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .lazy-section.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        .lazy-section .stagger-child {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .lazy-section.visible .stagger-child:nth-child(1) { opacity: 1; transform: translateY(0); transition-delay: 0.1s; }
        .lazy-section.visible .stagger-child:nth-child(2) { opacity: 1; transform: translateY(0); transition-delay: 0.2s; }
        .lazy-section.visible .stagger-child:nth-child(3) { opacity: 1; transform: translateY(0); transition-delay: 0.3s; }
        .lazy-section.visible .stagger-child:nth-child(4) { opacity: 1; transform: translateY(0); transition-delay: 0.4s; }
        .lazy-section.visible .stagger-child:nth-child(5) { opacity: 1; transform: translateY(0); transition-delay: 0.5s; }
        .lazy-section.visible .stagger-child:nth-child(6) { opacity: 1; transform: translateY(0); transition-delay: 0.6s; }
        .lazy-section .blur-reveal {
          opacity: 0; filter: blur(8px); transform: translateY(20px);
          transition: opacity 0.8s ease, filter 0.8s ease, transform 0.8s ease;
        }
        .lazy-section.visible .blur-reveal { opacity: 1; filter: blur(0); transform: translateY(0); }
        .lazy-section .scale-up {
          opacity: 0; transform: scale(0.85);
          transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .lazy-section.visible .scale-up { opacity: 1; transform: scale(1); transition-delay: 0.2s; }

        /* ---- NAVBAR ---- */
        .navbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          height: 64px; display: flex; align-items: center;
          justify-content: space-between; padding: 0 2.5rem;
          background: rgba(255, 248, 237, .9);
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 1px 0 rgba(222, 214, 204, .7);
          transition: background .25s, box-shadow .25s;
        }
        .navbar.scrolled {
          background: rgba(255, 248, 237, .96);
          box-shadow: 0 1px 0 rgba(222, 214, 204, .8);
        }
        .nav-links { position: absolute; left: 50%; transform: translateX(-50%); display: flex; gap: 2rem; align-items: center; }
        .nav-link {
          position: relative; font-size: 14px; font-weight: 500; color: var(--gray4);
          text-decoration: none; letter-spacing: -.01em; transition: color .15s; padding-bottom: 2px;
        }
        .nav-link::after {
          content: ''; position: absolute; left: 0; bottom: -3px;
          width: 0; height: 2px; border-radius: 2px;
          background: var(--grad-90); transition: width .2s ease;
        }
        .nav-link:hover { color: var(--ink); }
        .nav-link:hover::after { width: 100%; }
        .nav-actions { display: flex; gap: .625rem; align-items: center; }
        .btn-ghost-nav {
          background: transparent; color: var(--ink);
          border: 1.5px solid var(--gray2); padding: 8px 20px;
          border-radius: 50px; font-size: 13.5px; font-weight: 600; cursor: pointer;
          font-family: var(--font); transition: border-color .15s, background .15s;
          text-decoration: none; display: inline-flex; align-items: center;
        }
        .btn-ghost-nav:hover { border-color: var(--coral); color: var(--coral); }
        .btn-primary-nav {
          background: var(--coral); color: white; border: none; padding: 9px 22px;
          border-radius: 50px; font-size: 13.5px; font-weight: 700; cursor: pointer;
          font-family: var(--font); transition: background .15s, transform .1s, box-shadow .15s;
          text-decoration: none; display: inline-flex; align-items: center; letter-spacing: -.01em;
        }
        .btn-primary-nav:hover { background: #E5542F; box-shadow: 0 4px 16px rgba(255,107,77,.3); }

        /* ---- HERO (split layout) ---- */
        .hero {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          padding: 7rem 2.5rem 4rem; position: relative; overflow: hidden; background: transparent;
        }
        .hero-bg-blob {
          display: none;
        }
        .blob-1 { width: 600px; height: 600px; background: var(--coral); top: -200px; left: -200px; }
        .blob-2 { width: 500px; height: 500px; background: var(--lemon); bottom: -100px; right: -150px; }
        .blob-3 { width: 300px; height: 300px; background: var(--amber); top: 40%; left: 50%; transform: translate(-50%,-50%); }
        .hero-inner { display: flex; align-items: center; gap: 4rem; max-width: 1200px; margin: 0 auto; width: 100%; position: relative; z-index: 1; }
        .hero-content { flex: 1; text-align: left; }
        .hero-image-wrap { flex: 0 0 480px; position: relative; display: flex; align-items: center; justify-content: center; background: transparent; }
        .hero-image-wrap img { position: relative; z-index: 1; object-fit: cover; border-radius: 0; background: transparent; }
        .hero-eyebrow {
          display: inline-flex; align-items: center; gap: 7px;
          background: var(--cream); border: 1px solid var(--beige);
          color: var(--coral); font-size: 14px; font-weight: 700;
          padding: 8px 20px; border-radius: 50px; margin-bottom: 2rem; letter-spacing: .02em;
        }
        .eyebrow-dot {
          width: 8px; height: 8px; border-radius: 50%; background: var(--coral);
          animation: pulse 2s ease infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: .5; transform: scale(.7); }
        }
        .hero-title {
          font-family: var(--serif); font-size: clamp(34px, 4.5vw, 54px);
          font-weight: 600; line-height: 1.1; color: var(--ink);
          max-width: 580px; letter-spacing: -.03em; margin-bottom: 1.25rem;
        }
        .hero-title em { font-style: italic; color: var(--coral); }
        .hero-sub {
          font-size: 16px; color: var(--gray4); max-width: 480px; line-height: 1.65;
          margin-bottom: 2rem; font-weight: 400;
        }
        .hero-sub strong { color: var(--ink); font-weight: 700; }
        .hero-ctas {
          display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem;
        }
        .btn-hero-primary {
          background: linear-gradient(135deg, #FF6B4D, #FFB347); color: white; border: none;
          padding: 15px 34px; border-radius: 50px; font-size: 15px; font-weight: 700;
          cursor: pointer; font-family: var(--font); letter-spacing: -.01em;
          transition: transform .15s, box-shadow .15s;
          box-shadow: 0 4px 20px rgba(255,107,77,.25);
          text-decoration: none; display: inline-flex; align-items: center; gap: 8px;
        }
        .btn-hero-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(255,107,77,.35); }
        .btn-hero-secondary {
          background: transparent; color: var(--ink); border: 1.5px solid var(--gray2);
          padding: 15px 34px; border-radius: 50px; font-size: 15px; font-weight: 600;
          cursor: pointer; font-family: var(--font); letter-spacing: -.01em;
          transition: border-color .15s, transform .15s;
          text-decoration: none; display: inline-flex; align-items: center; gap: 8px;
        }
        .btn-hero-secondary:hover { border-color: var(--ink); transform: translateY(-2px); }
        .hero-recruiter-link { font-size: 13px; color: var(--gray3); margin-bottom: 1.25rem; }
        .hero-recruiter-link a { color: var(--coral); font-weight: 700; text-decoration: none; }
        .hero-recruiter-link a:hover { text-decoration: underline; }
        .hero-social-proof {
          display: flex; align-items: center; gap: .625rem; font-size: 13px;
          color: var(--gray3); margin-bottom: .75rem;
        }
        .proof-avatars { display: flex; }
        .proof-avatar {
          width: 28px; height: 28px; border-radius: 50%; border: 2px solid white;
          display: flex; align-items: center; justify-content: center;
          font-size: 9px; font-weight: 700; margin-left: -8px; flex-shrink: 0;
        }
        .proof-avatar:first-child { margin-left: 0; }
        .hero-badge-row { display: flex; gap: .75rem; flex-wrap: wrap; }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 5px; font-size: 12px;
          font-weight: 600; color: var(--gray4); background: var(--gray1);
          padding: 5px 12px; border-radius: 50px; border: 1px solid var(--gray2);
        }
        .hero-badge-dot { width: 6px; height: 6px; border-radius: 50%; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ---- STATS (with image) ---- */
        .stats-strip {
          position: relative; overflow: hidden;
          background: #FFF8ED;
          padding: 4.75rem 2.4rem;
        }
        .stats-strip::before {
          content: ''; position: absolute; width: 260px; height: 260px; left: -155px; bottom: -145px;
          border-radius: 50%; background: #FFE7D1; opacity: .65;
        }
        .stats-strip::after {
          content: ''; position: absolute; width: 220px; height: 220px; right: -120px; top: -120px;
          border-radius: 50%; border: 1px solid rgba(255, 130, 71, .16);
          box-shadow: 0 0 0 22px rgba(255, 130, 71, .035), 0 0 0 44px rgba(255, 130, 71, .025);
        }
        .stats-inner {
          position: relative; z-index: 1; max-width: 1390px; margin: 0 auto;
          display: flex; gap: clamp(2.75rem, 5vw, 4.75rem); align-items: center;
        }
        .stats-image-container {
          flex: 0 0 min(32vw, 430px); aspect-ratio: 430 / 450; height: auto;
          border: 3px solid #fff; border-radius: 32px; overflow: hidden; background: #e9e5df;
          box-shadow: 0 20px 36px rgba(74, 57, 35, .12), 0 0 0 2px rgba(255, 130, 71, .35), 0 0 24px rgba(255, 130, 71, .35);
          transform: translateZ(0);
        }
        .stats-image-container img {
          width: 100%; height: 100%; object-fit: cover; object-position: center; display: block;
          transition: transform .5s cubic-bezier(.22,1,.36,1);
        }
        .stats-image-container:hover img { transform: scale(1.035); }
        .stats-grid-container {
          flex: 1; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.25rem 1rem;
        }
        .stat-item {
          position: relative; display: flex; flex-direction: column; justify-content: center; text-align: left;
          min-height: 185px; padding: 1.5rem 1.75rem; overflow: hidden;
          background: rgba(255, 255, 255, .9); border: 1px solid rgba(222, 214, 204, .8); border-radius: 20px;
          box-shadow: 0 10px 28px rgba(80, 55, 30, .04); transition: transform .2s, box-shadow .2s;
        }
        .stat-item:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,.06); }
        .stat-item:last-child { grid-column: 1 / -1; }
        .stat-icon {
          display: flex; align-items: center; justify-content: center; width: 60px; height: 60px;
          margin-bottom: 1rem; border-radius: 50%; color: #ef6f2d; background: #FFF0E4;
        }
        .stat-icon svg { width: 28px; height: 28px; stroke-width: 1.8; }
        .stat-number {
          position: relative; z-index: 1; font-family: 'DM Sans', sans-serif !important; font-size: clamp(46px, 3.5vw, 60px); font-weight: 500;
          color: #171b29; line-height: .95; letter-spacing: -.055em; margin-bottom: .7rem;
        }
        .stat-suffix { color: #f16f32; }
        .stat-label { position: relative; z-index: 1; font-family: 'DM Sans', sans-serif !important; font-size: clamp(15px, 1.2vw, 18px); color: #252938; font-weight: 500; line-height: 1.2; }
        .stat-chart { position: absolute; right: 0; bottom: 0; width: 62%; height: 78%; opacity: .95; pointer-events: none; }
        .stat-chart path { fill: none; stroke: #ff854b; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
        .stat-chart .chart-fill { fill: url(#stats-chart-fill); stroke: none; opacity: .55; }
        .stat-chart line { stroke: #ffb38a; stroke-width: 1; stroke-dasharray: 5 7; opacity: .45; }
        .stat-chart circle { fill: #fff; stroke: #ff854b; stroke-width: 3; }

        /* ---- TECH CAROUSEL ---- */
        .tech-carousel-section {
          padding: 3.5rem 0; overflow: hidden; 
          // background: var(--white);
          // border-bottom: 1px solid var(--gray2); 
          margin-top: 2.5rem;
        }
        .tech-carousel-label {
          text-align: center; font-size: 11.5px; font-weight: 700;
          letter-spacing: .12em; text-transform: uppercase; color: var(--gray3); margin-bottom: 1.75rem;
        }
        .tech-marquee-wrap { position: relative; overflow: hidden; }
        .tech-marquee-wrap::before, .tech-marquee-wrap::after {
          content: ''; position: absolute; top: 0; bottom: 0; width: 120px; z-index: 2; pointer-events: none;
        }
        .tech-marquee-wrap::before { left: 0; background: linear-gradient(to right, var(--white) 0%, transparent 100%); }
        .tech-marquee-wrap::after { right: 0; background: linear-gradient(to left, var(--white) 0%, transparent 100%); }
        .tech-marquee-track {
          display: flex; width: max-content; gap: 10px; padding: 6px 0;
          animation: techScrollRight 38s linear infinite;
        }
        .tech-marquee-wrap:hover .tech-marquee-track { animation-play-state: paused; }
        @keyframes techScrollRight { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        .tech-pill {
          display: flex; align-items: center; gap: 10px; padding: 10px 20px;
          border-radius: 999px; border: 1px solid var(--gray2); background: var(--white);
          white-space: nowrap; cursor: default;
          transition: border-color .2s, transform .2s, box-shadow .2s; user-select: none;
        }
        .tech-pill:hover { border-color: var(--coral); transform: translateY(-2px) scale(1.03); box-shadow: 0 4px 16px rgba(255,107,77,.12); }
        .tech-pill-icon { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; flex-shrink: 0; }
        .tech-pill span { font-size: 13.5px; font-weight: 600; color: var(--ink); letter-spacing: -.01em; }

        /* ---- SOCIAL PROOF MARQUEE (with photos) ---- */
        .proof-section { 
        padding: 5rem 0; 
        // background: var(--gray1);
        background: #FFF8ED; 
        // border-top: 1px solid var(--gray2); 
        // border-bottom: 1px solid var(--gray2); 
        overflow: hidden; }
        .proof-header { text-align: center; margin-bottom: 3rem; padding: 0 1.5rem; }
        .proof-eyebrow { display: inline-flex; align-items: center; gap: 6px; font-size: 11.5px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--coral); margin-bottom: .875rem; }
        .proof-title { font-family: var(--serif); font-size: clamp(26px, 3vw, 38px); font-weight: 600; color: var(--ink); letter-spacing: -.03em; line-height: 1.15; }
        .proof-title em { font-style: italic; color: var(--coral); }
        .proof-marquee-wrap { position: relative; overflow: hidden; }
        .proof-marquee-wrap::before, .proof-marquee-wrap::after { content: ''; position: absolute; top: 0; bottom: 0; width: 140px; z-index: 2; pointer-events: none; }
        .proof-marquee-wrap::before { left: 0; background: linear-gradient(to right, var(--gray1) 0%, transparent 100%); }
        .proof-marquee-wrap::after { right: 0; background: linear-gradient(to left, var(--gray1) 0%, transparent 100%); }
        .proof-marquee-track { display: flex; width: max-content; gap: 16px; padding: 8px 8px 16px; animation: proofScroll 50s linear infinite; }
        .proof-marquee-wrap:hover .proof-marquee-track { animation-play-state: paused; }
        @keyframes proofScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .proof-card { width: 520px; min-height: 220px; display: flex; flex-shrink: 0; overflow: hidden; background: var(--white); border: 1px solid var(--gray2); border-radius: 20px; padding: 0; transition: transform .2s, box-shadow .2s; cursor: default; }
        .proof-card:hover { transform: translateY(-4px); box-shadow: 0 12px 36px rgba(0,0,0,.07); }
        .proof-card-media { width: 200px; min-height: 220px; flex-shrink: 0; overflow: hidden; }
        .proof-card-media img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .proof-card-content { flex: 1; min-width: 0; display: flex; flex-direction: column; padding: 1.5rem; }
        .proof-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 1rem; }
        .proof-avatar-wrap { display: flex; align-items: center; gap: 10px; }
        .proof-card .proof-avatar { width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; flex-shrink: 0; border: none; margin-left: 0; }
        .proof-name { font-size: 14px; font-weight: 700; color: var(--ink); letter-spacing: -.01em; }
        .proof-role { font-size: 11.5px; color: var(--gray3); margin-top: 1px; }
        .proof-score-badge { font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 50px; background: linear-gradient(90deg, #FF6B4D, #FFB347); color: white; flex-shrink: 0; white-space: nowrap; }
        .proof-quote { font-size: 13.5px; color: var(--gray4); line-height: 1.65; font-style: italic; margin-bottom: 1rem; }
        .proof-card-footer { display: flex; align-items: center; gap: 6px; margin-top: auto; padding-top: .875rem; border-top: 1px solid var(--gray2); }
        .proof-company-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--coral); flex-shrink: 0; }
        .proof-company { font-size: 11.5px; font-weight: 700; color: var(--coral); }
        .proof-stars { margin-left: auto; display: flex; gap: 2px; }
        .proof-star { width: 11px; height: 11px; background: #FFD84D; clip-path: polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%); }

        /* ---- SECTIONS ---- */
        .section { padding: 6rem 1.5rem; }
        .section-inner { max-width: 1100px; margin: 0 auto; }
        .section-eyebrow { display: inline-flex; align-items: center; gap: 6px; font-size: 16px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: var(--coral); margin-bottom: 1rem; }
        .section-title { font-family: var(--serif); font-size: clamp(28px, 3.5vw, 42px); font-weight: 600; color: var(--ink); line-height: 1.15; letter-spacing: -.03em; margin-bottom: 1rem; }
        .section-title em { font-style: italic; color: var(--coral); }
        .section-sub { font-size: 16px; color: var(--gray4); line-height: 1.65; max-width: 500px; }

        /* ---- HOW IT WORKS ---- */
        .steps-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 1.25rem; margin-top: 3.5rem; }
        .step-card { background: var(--white); border: 1px solid var(--gray2); border-radius: 20px; padding: 1.75rem 1.5rem; position: relative; transition: transform .2s, box-shadow .2s, border-color .2s; }
        .step-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,.07); border-color: var(--coral); }
        .step-num { font-family: var(--serif); font-size: 11px; font-weight: 600; letter-spacing: .1em; color: var(--gray3); margin-bottom: 1rem; text-transform: uppercase; }
        .step-icon-wrap { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; }
        .step-title { font-size: 16px; font-weight: 700; color: var(--ink); margin-bottom: .5rem; letter-spacing: -.02em; }
        .step-desc { font-size: 13.5px; color: var(--gray4); line-height: 1.6; }
        .step-connector { position: absolute; right: -14px; top: 50%; transform: translateY(-50%); width: 28px; height: 28px; background: var(--white); border: 1.5px solid var(--gray2); border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 1; }

        /* ---- FEATURES (enhanced 6-card) ---- */
        .features-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.25rem; margin-top: 3.5rem; }
        .hiw-step-num { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; background: var(--grad-90); color: white; font-size: 14px; font-weight: 800; margin-bottom: 1rem; }
        .feature-card { background: var(--white); border: 1px solid var(--gray2); border-radius: 24px; padding: 2.25rem 2rem; min-height: 240px; transition: transform .25s cubic-bezier(.22,1,.36,1), box-shadow .25s, border-color .25s; position: relative; overflow: hidden; text-align: left; }
        .feature-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: var(--grad-90); opacity: 0; transition: opacity .25s; border-radius: 24px 24px 0 0; }
        .feature-card:hover { transform: translateY(-6px); box-shadow: 0 16px 48px rgba(255,107,77,.10); border-color: var(--coral); }
        .feature-card:hover::before { opacity: 1; }
        .feature-title { font-size: 18px; font-weight: 700; color: var(--ink); margin-bottom: .625rem; letter-spacing: -.02em; }
        .feature-desc { font-size: 14px; color: var(--gray4); line-height: 1.7; }

        @keyframes scoreRingFill {
          from { stroke-dasharray: 0 264; }
          to { stroke-dasharray: 205.92 58.08; }
        }
        .score-ring-animated {
          animation: scoreRingFill 1.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        /* ---- ANTYL SCORE SECTION ---- */
        .score-section { 
        background: #FFF8ED;; 
        padding: 6rem 1.5rem; 
        // border-top: 1px solid var(--gray2); 
        // border-bottom: 1px solid var(--gray2); 
        }

        /* ---- TESTIMONIALS ---- */
        .testimonials-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.25rem; margin-top: 3.5rem; }
        .testimonial-card { background: var(--white); border: 1px solid var(--gray2); border-radius: 20px; padding: 1.75rem; transition: transform .2s, box-shadow .2s; }
        .testimonial-card:hover { transform: translateY(-3px); box-shadow: 0 8px 32px rgba(0,0,0,.06); }
        .quote-mark { font-family: var(--serif); font-size: 48px; line-height: .8; color: var(--beige); margin-bottom: .5rem; font-style: italic; }
        .quote-text { font-size: 14.5px; color: var(--ink); line-height: 1.65; margin-bottom: 1.25rem; }
        .testimonial-footer { display: flex; align-items: center; gap: .75rem; }
        .t-avatar { width: 40px; height: 40px; border-radius: 50%; background: var(--cream); border: 2px solid var(--beige); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: var(--coral); flex-shrink: 0; }
        .t-name { font-size: 13px; font-weight: 700; color: var(--ink); }
        .t-role { font-size: 11px; color: var(--gray3); margin-top: 2px; }
        .t-score { margin-left: auto; flex-shrink: 0; background: linear-gradient(90deg,#FF6B4D,#FFB347); color: white; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 50px; }

        /* ---- SINGLE CTA (recruiter teaser) ---- */
        .single-cta-section { 
        padding: 6rem 1.5rem; 
        // background: var(--white); 
        }
        .single-cta-card { max-width: 1000px; margin: 0 auto; border-radius: 24px; padding: 3rem; position: relative; overflow: hidden; background: var(--ink); color: white; text-align: center; }
        .single-cta-title { font-family: var(--serif); font-size: clamp(24px, 3vw, 32px); font-weight: 600; line-height: 1.2; margin-bottom: .75rem; letter-spacing: -.03em; }
        .single-cta-sub { font-size: 14.5px; opacity: .75; line-height: 1.6; margin-bottom: 2rem; max-width: 440px; margin-left: auto; margin-right: auto; }
        .btn-cta-white { background: white; color: var(--coral); border: none; padding: 12px 28px; border-radius: 50px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: var(--font); letter-spacing: -.01em; transition: transform .15s, box-shadow .15s; text-decoration: none; display: inline-flex; align-items: center; gap: 7px; }
        .btn-cta-white:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,.15); }
        .cta-bg-shape { position: absolute; border-radius: 50%; opacity: .08; pointer-events: none; }

        /* ---- FOOTER ---- */
        .footer { background: var(--ink); color: white; padding: 3.5rem 2.5rem 2rem; }
        .footer-inner { max-width: 1100px; margin: 0 auto; }
        .footer-top { display: flex; justify-content: space-between; gap: 3rem; padding-bottom: 2.5rem; border-bottom: 1px solid rgba(255,255,255,.08); flex-wrap: wrap; }
        .footer-brand { max-width: 260px; }
        .footer-brand-desc { font-size: 13px; color: rgba(255,255,255,.45); line-height: 1.65; }
        .footer-col-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: rgba(255,255,255,.35); margin-bottom: 1rem; }
        .footer-links { display: flex; flex-direction: column; gap: .625rem; }
        .footer-link { font-size: 13.5px; color: rgba(255,255,255,.6); text-decoration: none; transition: color .15s, padding-left .15s; width: fit-content; }
        .footer-link:hover { color: white; padding-left: 3px; }
        .footer-bottom { display: flex; justify-content: space-between; align-items: center; padding-top: 2rem; font-size: 12px; color: rgba(255,255,255,.3); flex-wrap: wrap; gap: .75rem; }
        .footer-bottom-links { display: flex; gap: 1.5rem; }
        .footer-bottom-link { color: rgba(255,255,255,.3); text-decoration: none; font-size: 12px; transition: color .15s; }
        .footer-bottom-link:hover { color: rgba(255,255,255,.7); }

        /* ---- RESPONSIVE ---- */
        @media (max-width: 900px) {
          .nav-links { display: none; }
          .hero-inner { flex-direction: column; text-align: center; }
          .hero-content { text-align: center; }
          .hero-image-wrap { flex: none; width: 360px; }
          .hero-ctas { justify-content: center; }
          .hero-badge-row { justify-content: center; }
          .hero-social-proof { justify-content: center; }
          .steps-grid { grid-template-columns: repeat(2,1fr); }
          .features-grid { grid-template-columns: repeat(2,1fr); }
          .testimonials-grid { grid-template-columns: 1fr; }
          .step-connector { display: none; }
        }
        @media (max-width: 600px) {
          .navbar { padding: 0 1.25rem; }
          .hero { padding: 6rem 1.25rem 3rem; }
          .steps-grid { grid-template-columns: 1fr; }
          .features-grid { grid-template-columns: 1fr; }
          .stats-strip { padding: 3rem 1.25rem; }
          .stats-inner { flex-direction: column; gap: 1.5rem; }
          .stats-image-container { width: 100%; max-width: 450px; height: auto; flex-basis: auto; }
          .stats-grid-container { width: 100%; gap: 1rem; }
          .stat-item { min-height: 185px; padding: 1.25rem; border-radius: 18px; }
          .proof-card { width: min(88vw, 420px); }
          .proof-card-media { width: 135px; }
          .single-cta-card { padding: 2rem 1.5rem; }
        }
      `}</style>

      <div className="page-gradient" aria-hidden="true" />

      {/* ─── NAVBAR ─── */}
      <nav className={`navbar${scrolled ? " scrolled" : ""}`}>
        <Link href='/' style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <Image src="/Antyl.png" alt="Antyl" width={50} height={50} />
        </Link>
        <div className="nav-links">
          <a href="#how-it-works" className="nav-link">How it works</a>
          <a href="#features" className="nav-link">Features</a>
          <a href="#antyl-score" className="nav-link">Antyl Score</a>
          <Link href="/recruiters" className="nav-link">For recruiters</Link>
        </div>
        <div className="nav-actions">
          <a href="/login" className="btn-ghost-nav">Log in</a>
          <a href="/signup?role=developer" className="btn-primary-nav">Get started free</a>
        </div>
      </nav>

      {/* ─── HERO (split layout: text left, image right) ─── */}
      <section className={`hero lazy-section${lazyHero.visible ? " visible" : ""}`} ref={lazyHero.ref}>
        <div className="hero-bg-blob blob-1" />
        <div className="hero-bg-blob blob-2" />
        <div className="hero-bg-blob blob-3" />
        <div className="hero-inner">
          <div className="hero-content">
            <div className="hero-eyebrow"><span className="eyebrow-dot" />Built for developers · Auto-apply built in</div>
            <h1 className="hero-title blur-reveal">Your job search<br />shouldn’t be <br /> <em>another full-time job.</em></h1>
            <p className="hero-sub blur-reveal">Create your profile once. Antyl verifies your skills and applies to relevant jobs for you.<strong> Swipe when you want. Auto-apply when you don’t.</strong></p>
            <div className="hero-ctas">
              <a href="/signup?role=developer" className="btn-hero-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
                </svg>
                Start finding jobs
              </a>
              <a href="#how-it-works" className="btn-hero-secondary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
                See how Antyl works
              </a>
            </div>
            <p className="hero-recruiter-link">Hiring instead? <Link href="/recruiters">Go to the recruiter side →</Link></p>
            <div className="hero-social-proof">
              <div className="proof-avatars">
                {[{ initials: "AK", bg: "#FFE8E3", color: "#FF6B4D" },{ initials: "PS", bg: "#FFF4E3", color: "#FFB347" },{ initials: "VR", bg: "#F3EFFE", color: "#8B5CF6" },{ initials: "NR", bg: "#EAFAF0", color: "#22C55E" }].map((a) => (
                  <div key={a.initials} className="proof-avatar" style={{ background: a.bg, color: a.color }}>{a.initials}</div>
                ))}
              </div>
              Join 50+ verified developers already on Antyl
            </div>
            <div className="hero-badge-row" style={{ marginTop: ".75rem" }}>
              <span className="hero-badge"><span className="hero-badge-dot" style={{ background: "#22C55E" }} />No whiteboard tests</span>
              <span className="hero-badge"><span className="hero-badge-dot" style={{ background: "#FF6B4D" }} />Auto-apply every 6 hours</span>
              <span className="hero-badge"><span className="hero-badge-dot" style={{ background: "#FFB347" }} />Free for developers</span>
            </div>
          </div>
          {/* Hero image - no blob, no border-radius */}
          <div className="hero-image-wrap">
            <Image src="/developer_pic.svg" alt="Developer using Antyl" width={6460} height={6540} style={{ objectFit: "cover", background: "transparent" }} priority />
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className={`section lazy-section${lazyHowItWorks.visible ? " visible" : ""}`} id="how-it-works"  ref={lazyHowItWorks.ref}>
        <div className="section-inner">
          <div style={{ maxWidth: 560 }}>
            <span className="section-eyebrow">
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--coral)", display: "inline-block" }} />
              How it works
            </span>
            <h2 className="section-title">
              From signup to <em>interview request</em> in 4 steps
            </h2>
            <p className="section-sub">
              No tedious forms. No weeks of waiting. Connect GitHub, get
              verified, set preferences, and let auto-apply run in the background.
            </p>
          </div>

          <div className="steps-grid">
            {steps.map((step, i) => (
              <div className="step-card stagger-child" key={step.num}>
                <div className="step-num">{step.num}</div>
                <div className="step-icon-wrap" style={{ background: step.bg, color: step.color }}>
                  {i === 0 && (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>)}
                  {i === 1 && (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>)}
                  {i === 2 && (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /><path d="M4.93 4.93a10 10 0 0 0 0 14.14" /></svg>)}
                  {i === 3 && (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>)}
                </div>
                <div className="step-title">{step.title}</div>
                <p className="step-desc">{step.desc}</p>
                {i < steps.length - 1 && (
                  <div className="step-connector">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--gray3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS (with image + grid) ─── */}
      <div className={`stats-strip lazy-section${lazyStats.visible ? " visible" : ""}`} ref={(el) => { (lazyStats.ref as React.MutableRefObject<HTMLDivElement | null>).current = el; statsRef.current = el; }}>
        <div className="stats-inner">
          <div className="stats-image-container">
            <img src="/Girl.jpeg" alt="Verified developer on Antyl" />
          </div>
          <div className="stats-grid-container">
            <div className="stat-item stagger-child">
              <div className="stat-icon" aria-hidden="true"><UserRoundCheck /></div>
              <div className="stat-number">
                {counts.devs >= 1000 ? `${(counts.devs / 1000).toFixed(counts.devs >= 10000 ? 0 : 1)}k` : counts.devs}
                <span className="stat-suffix">+</span>
              </div>
              <div className="stat-label">Verified developers</div>
            </div>
            <div className="stat-item stagger-child">
              <div className="stat-icon" aria-hidden="true"><Building2 /></div>
              <div className="stat-number">{counts.companies}<span className="stat-suffix">+</span></div>
              <div className="stat-label">Companies hiring</div>
            </div>
            <div className="stat-item stagger-child">
              <div className="stat-icon" aria-hidden="true"><Crosshair /></div>
              <div className="stat-number">{counts.match}<span className="stat-suffix">%</span></div>
              <div className="stat-label">Match accuracy</div>
              <svg className="stat-chart" viewBox="0 0 420 180" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <linearGradient id="stats-chart-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#ff9b67" stopOpacity=".35" />
                    <stop offset="1" stopColor="#ff9b67" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path className="chart-fill" d="M0 180V165C45 153 56 142 91 139C127 136 136 120 163 111C190 102 205 110 229 98C258 83 258 52 295 53C327 55 328 65 357 53C378 44 390 29 420 8V180Z" />
                <line x1="295" y1="53" x2="295" y2="180" />
                <line x1="357" y1="53" x2="357" y2="180" />
                <line x1="420" y1="8" x2="420" y2="180" />
                <path d="M0 165C45 153 56 142 91 139C127 136 136 120 163 111C190 102 205 110 229 98C258 83 258 52 295 53C327 55 328 65 357 53C378 44 390 29 420 8" />
                <circle cx="420" cy="8" r="7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ─── TECH CAROUSEL ─── */}
      <section className={`tech-carousel-section lazy-section${lazyTech.visible ? " visible" : ""}`} ref={lazyTech.ref}>
        <p className="tech-carousel-label">Verified across every major stack</p>
        <div className="tech-marquee-wrap">
          <div className="tech-marquee-track">
            {[...carouselSkills, ...carouselSkills].map((s, i) => (
              <div className="tech-pill" key={i}>
                <span className="tech-pill-icon">{logos[s.key]}</span>
                <span>{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF MARQUEE (with photos) ─── */}
      <section className={`proof-section lazy-section${lazyProof.visible ? " visible" : ""}`} ref={lazyProof.ref}>
        <div className="proof-header">
          <div className="proof-eyebrow">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--coral)", display: "inline-block" }} />
            Trusted by developers
          </div>
          <h2 className="proof-title">
            Real people. <em>Real results.</em>
          </h2>
        </div>
        <div className="proof-marquee-wrap">
          <div className="proof-marquee-track">
            {[...carouselTestimonials, ...carouselTestimonials].map((t, i) => (
              <div className="proof-card" key={i}>
                <div className="proof-card-media" style={{ background: t.bg }}>
                  <img src={t.photo} alt={`${t.name} photo`} loading="lazy" />
                </div>
                <div className="proof-card-content">
                  <div className="proof-card-top">
                    <div>
                      <div className="proof-name">{t.name}</div>
                      <div className="proof-role">{t.role}</div>
                    </div>
                    <div className="proof-score-badge">{t.tier} · {t.score}</div>
                  </div>
                  <p className="proof-quote">&ldquo;{t.quote}&rdquo;</p>
                  <div className="proof-card-footer">
                    <span className="proof-company-dot" />
                    <span className="proof-company">{t.company}</span>
                    <div className="proof-stars">
                      {[...Array(5)].map((_, si) => <div className="proof-star" key={si} />)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ANTYL SCORE ─── */}
      <section className={`score-section lazy-section${lazyScore.visible ? " visible" : ""}`} id="antyl-score" ref={lazyScore.ref}>
        <div className="section-inner">
          <div style={{ textAlign: "center", marginBottom: "1rem" }}>
            <span className="section-eyebrow">
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--coral)", display: "inline-block" }} />
              Antyl Score
            </span>
            <h2 className="section-title">One number that tells<em> the whole story</em></h2>
            <p style={{ fontSize: 16, color: "var(--gray4)", lineHeight: 1.65, maxWidth: 540, margin: "0 auto" }}>
              After verification, you get a score from 0–100 across 4 dimensions. It lives on your profile and updates with every session.
            </p>
          </div>
          <div className="scale-up" style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.5rem", marginTop: "3rem" }}>
            <div style={{ background: "var(--white)", border: "1px solid var(--gray2)", borderRadius: 24, padding: "2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--coral)", fontSize: 13, fontWeight: 600, marginBottom: "1.25rem" }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Your verified developer profile
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>Your Antyl Score</h3>
              <p style={{ fontSize: 13, color: "var(--gray3)", marginBottom: "1.5rem" }}>A complete view of your verified capabilities.</p>
              <div style={{ display: "flex", gap: "2.5rem", alignItems: "flex-start" }}>
                <div style={{ flexShrink: 0, width: 200 }}>
                  <div style={{ background: "#1a1a1a", borderRadius: 36, padding: 10, boxShadow: "0 12px 40px rgba(0,0,0,.15)" }}>
                    <div style={{ background: "white", borderRadius: 28, padding: "1.25rem", minHeight: 280, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 12 }}>
                        <svg width="12" height="12" fill="#22C55E" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span style={{ fontSize: 10, color: "var(--gray3)" }}>Verified profile</span>
                      </div>
                      <div style={{ position: "relative", width: 110, height: 110, marginBottom: 12 }}>
                        <svg width="110" height="110" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
                          <circle cx="50" cy="50" r="42" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                          <circle className={lazyScore.visible ? "score-ring-animated" : ""} cx="50" cy="50" r="42" fill="none" stroke="#FF6B4D" strokeWidth="8" strokeDasharray="0 264" strokeLinecap="round" />
                        </svg>
                        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: 36, fontWeight: 700, color: "var(--ink)", fontFamily: "var(--serif)" }}>{scoreCount}</span>
                          <span style={{ fontSize: 10, color: "var(--gray3)" }}>/ 100</span>
                        </div>
                      </div>
                      <span style={{ background: "var(--coral)", color: "white", fontSize: 10, fontWeight: 700, padding: "4px 16px", borderRadius: 50, textTransform: "uppercase", letterSpacing: ".04em" }}>Advanced</span>
                      <div style={{ marginTop: 16, width: "100%" }}>
                        <p style={{ fontSize: 9, fontWeight: 700, color: "var(--ink)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Score Tiers</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          <span style={{ fontSize: 7, border: "1px solid var(--gray2)", borderRadius: 6, padding: "2px 6px", color: "var(--gray3)" }}>Beginner 0-40</span>
                          <span style={{ fontSize: 7, border: "1px solid var(--gray2)", borderRadius: 6, padding: "2px 6px", color: "var(--gray3)" }}>Mid 41-65</span>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                          <span style={{ fontSize: 7, border: "2px solid var(--coral)", borderRadius: 6, padding: "2px 6px", color: "var(--coral)", fontWeight: 700, background: "var(--cream)" }}>Advanced 66-85</span>
                          <span style={{ fontSize: 7, border: "1px solid var(--gray2)", borderRadius: 6, padding: "2px 6px", color: "var(--gray3)" }}>Expert 86-100</span>
                        </div>
                        <p style={{ fontSize: 8, color: "var(--coral)", fontWeight: 700, marginTop: 8 }}>Top 18% of developers</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: 17, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>Dimension breakdown</h4>
                  <p style={{ fontSize: 13, color: "var(--gray3)", marginBottom: "1.5rem" }}>See how your verified skills contribute to the score.</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    {scoreDimensions.map((dim, i) => (
                      <div key={dim.label}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{dim.label}</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{dim.value}%</span>
                        </div>
                        <div style={{ height: 10, background: "var(--gray2)", borderRadius: 5, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: lazyScore.visible ? `${dim.value}%` : "0%", background: "linear-gradient(90deg, #FF6B4D, #FFB347)", borderRadius: 5, transition: `width 1.2s cubic-bezier(0.22, 1, 0.36, 1) ${0.3 + i * 0.15}s` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: "1.5rem", background: "var(--cream)", borderRadius: 12, padding: "12px 16px" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--beige)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="16" height="16" fill="none" stroke="var(--coral)" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <p style={{ fontSize: 13, color: "var(--gray4)" }}>This preview updates live as your score changes.</p>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ background: "var(--white)", border: "1px solid var(--gray2)", borderRadius: 24, padding: "2rem", height: "fit-content" }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>Keep improving your score</h3>
              <p style={{ fontSize: 13, color: "var(--gray3)", marginBottom: "1.5rem", lineHeight: 1.6 }}>A small improvement can make your profile stand out to more relevant employers.</p>
              <div style={{ background: "var(--gray1)", border: "1px solid var(--gray2)", borderRadius: 16, padding: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--coral)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="12" height="12" fill="white" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--gray4)" }}>Next milestone</span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 44, fontWeight: 700, color: "var(--ink)", fontFamily: "var(--serif)", lineHeight: 1 }}>86</span>
                  <span style={{ fontSize: 14, color: "var(--gray3)" }}>Expert tier</span>
                </div>
                <p style={{ fontSize: 13, color: "var(--gray3)", lineHeight: 1.6 }}>You are 8 points away. View tailored recommendations to see your fastest path forward.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES (enhanced 6-card with stagger) ─── */}
      <section className={`section lazy-section${lazyFeatures.visible ? " visible" : ""}`} id="features" ref={lazyFeatures.ref}>
        <div className="section-inner" style={{ textAlign: "center" }}>
          <span className="section-eyebrow" style={{ justifyContent: "center" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--coral)", display: "inline-block" }} />
            Everything included
          </span>
          <h2 className="section-title blur-reveal">Built for developers <em>tired of the grind</em></h2>
          <p className="section-sub" style={{ margin: "0 auto 3.5rem" }}>Every feature is designed to remove friction from your job search - so you spend less time applying and more time coding.</p>

          <div className="features-grid">
            {/* Card 1 */}
            <div className="feature-card stagger-child">
              <span className="hiw-step-num">1</span>
              <div className="feature-title">Connect your portfolio</div>
              <p className="feature-desc">We securely connect with your portfolio to understand your real work and projects.</p>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginTop: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 24, height: 24, background: "var(--cream)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="11" height="11" fill="var(--coral)" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--gray3)", fontWeight: 500 }}>Secure connection</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 72, height: 72, borderRadius: 16, background: "var(--white)", border: "1px solid var(--gray2)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, boxShadow: "0 4px 16px rgba(0,0,0,.05)" }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF6B4D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                    <span style={{ fontSize: 10, fontWeight: 600, color: "var(--gray4)" }}>Portfolio</span>
                  </div>
                  <svg viewBox="0 0 32 14" fill="none" style={{ width: 32, height: 14 }}><path d="M2 7h24m0 0l-5-5m5 5l-5 5" stroke="url(#ca2)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><defs><linearGradient id="ca2" x1="0" y1="7" x2="32" y2="7"><stop stopColor="#FF6B4D"/><stop offset="1" stopColor="#FFB347"/></linearGradient></defs></svg>
                  <div style={{ width: 72, height: 72, borderRadius: 16, background: "var(--white)", border: "1px solid var(--gray2)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, boxShadow: "0 4px 16px rgba(0,0,0,.05)" }}>
                    <Image src="/Antyl.png" alt="Antyl" width={36} height={36} style={{ objectFit: "contain" }} />
                    <span style={{ fontSize: 10, fontWeight: 600, color: "var(--gray4)" }}>Antyl</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Card 2 */}
            <div className="feature-card stagger-child">
              <span className="hiw-step-num">2</span>
              <div className="feature-title">Auto-apply runs for you</div>
              <p className="feature-desc">Every 6 hours, Antyl applies you to matching jobs automatically.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: "1rem" }}>
                {[{ text: "Applied to Frontend @ Microsoft", time: "2h ago" },{ text: "Applied to SDE II @ Meta", time: "4h ago" },{ text: "Applied to Full Stack @ SAP", time: "6h ago" }].map((item) => (
                  <div key={item.text} style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--gray1)", borderRadius: 12, padding: "10px 14px" }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--coral)", flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: "var(--ink)", fontWeight: 500 }}>{item.text}</span>
                    <span style={{ fontSize: 10, color: "var(--gray3)", marginLeft: "auto" }}>{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Card 3 */}
            <div className="feature-card stagger-child">
              <span className="hiw-step-num">3</span>
              <div className="feature-title">Antyl Score</div>
              <p className="feature-desc">One score from 0–100 that tells the whole story. Carries across every job application on Antyl.</p>
              <div style={{ display: "flex", gap: "1.25rem", alignItems: "center", marginTop: "1rem" }}>
                <div style={{ position: "relative", width: 90, height: 90, flexShrink: 0 }}>
                  <svg width="90" height="90" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}><circle cx="50" cy="50" r="42" fill="none" stroke="#f3f4f6" strokeWidth="8" /><circle cx="50" cy="50" r="42" fill="none" stroke="url(#sg3d)" strokeWidth="8" strokeDasharray="206 58" strokeLinecap="round" /><defs><linearGradient id="sg3d" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#FF6B4D"/><stop offset="100%" stopColor="#FFB347"/></linearGradient></defs></svg>
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 26, fontWeight: 700, color: "var(--ink)", fontFamily: "var(--serif)" }}>78</span><span style={{ fontSize: 9, color: "var(--gray3)" }}>/ 100</span></div>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                  {[{ label: "Code quality", value: 82 },{ label: "Architecture", value: 75 },{ label: "Consistency", value: 80 },{ label: "Impact", value: 74 }].map((d) => (
                    <div key={d.label}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}><span style={{ fontSize: 10, fontWeight: 600, color: "var(--ink)" }}>{d.label}</span><span style={{ fontSize: 10, fontWeight: 700, color: "var(--gray3)" }}>{d.value}%</span></div><div style={{ height: 5, background: "var(--gray2)", borderRadius: 3, overflow: "hidden" }}><div style={{ height: "100%", width: `${d.value}%`, background: "linear-gradient(90deg, #FF6B4D, #FFB347)", borderRadius: 3 }} /></div></div>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14 }}><span style={{ background: "var(--coral)", color: "white", fontSize: 10, fontWeight: 700, padding: "4px 14px", borderRadius: 50, textTransform: "uppercase" as const, letterSpacing: ".04em" }}>Advanced</span><span style={{ fontSize: 11, color: "var(--coral)", fontWeight: 700 }}>Top 18% of developers</span></div>
            </div>
            {/* Card 4 */}
            <div className="feature-card stagger-child">
              <span className="hiw-step-num">4</span>
              <div className="feature-title">Application tracking</div>
              <p className="feature-desc">See every job you&apos;ve been auto-applied to and its live status, in one dashboard.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: "1rem" }}>
                {[{ company: "Microsoft", role: "Frontend Engineer", time: "Applied 2h ago", status: "Interview", statusColor: "#8B5CF6", statusBg: "#F3EFFE" },{ company: "Google", role: "SDE II", time: "Applied 5h ago", status: "Offer", statusColor: "#22C55E", statusBg: "#EAFAF0" },{ company: "McKinsey", role: "Full Stack Dev", time: "Applied 8h ago", status: "Applied", statusColor: "var(--amber)", statusBg: "#FFF8ED" }].map((item) => (
                  <div key={item.company} style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--gray1)", borderRadius: 12, padding: "10px 14px" }}><div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>{item.company}</div><div style={{ fontSize: 10, color: "var(--gray3)" }}>{item.role} · {item.time}</div></div><span style={{ fontSize: 10, fontWeight: 700, color: item.statusColor, background: item.statusBg, padding: "3px 10px", borderRadius: 50 }}>{item.status}</span></div>
                ))}
              </div>
            </div>
            {/* Card 5 */}
            <div className="feature-card stagger-child">
              <span className="hiw-step-num">5</span>
              <div className="feature-title">Score improvement tips</div>
              <p className="feature-desc">Get <strong style={{ color: "var(--coral)" }}>AI-powered</strong> suggestions based on <strong style={{ color: "var(--coral)" }}>current industry demands</strong> and what top companies are hiring for.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: "1rem", textAlign: "left" }}>
                {[{ icon: "🎯", text: "Learn System Design — required by Meta, Google", priority: "High", color: "var(--coral)", bg: "#FFF0ED" },{ icon: "📊", text: "Add AWS/Cloud certs — trending at SAP, Microsoft", priority: "Med", color: "var(--amber)", bg: "#FFF8ED" },{ icon: "🤖", text: "Build AI/ML projects — top demand in industry", priority: "Hot", color: "#22C55E", bg: "#EAFAF0" }].map((tip) => (
                  <div key={tip.text} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "var(--gray1)", borderRadius: 12 }}><div style={{ width: 28, height: 28, borderRadius: 8, background: tip.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{tip.icon}</div><span style={{ fontSize: 12, color: "var(--ink)", fontWeight: 500, textAlign: "left" }}>{tip.text}</span><span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: tip.color, flexShrink: 0 }}>{tip.priority}</span></div>
                ))}
              </div>
            </div>
            {/* Card 6 */}
            <div className="feature-card stagger-child">
              <span className="hiw-step-num">6</span>
              <div className="feature-title">Seen by real recruiters</div>
              <p className="feature-desc">Verified companies filter candidates by Antyl Score - your profile surfaces to people actively hiring.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: "1rem" }}>
                {[{ name: "Priya M.", company: "Google", action: "Viewed your profile", time: "1h ago" },{ name: "Rahul K.", company: "Microsoft", action: "Shortlisted you", time: "3h ago" },{ name: "Anika S.", company: "McKinsey", action: "Sent interview invite", time: "5h ago" }].map((r) => (
                  <div key={r.name} style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--gray1)", borderRadius: 12, padding: "10px 14px" }}><div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--cream)", border: "1px solid var(--beige)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "var(--coral)", flexShrink: 0 }}>{r.name.split(" ").map(n => n[0]).join("")}</div><div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>{r.name} <span style={{ fontWeight: 400, color: "var(--gray3)" }}>· {r.company}</span></div><div style={{ fontSize: 10, color: "var(--coral)", fontWeight: 500 }}>{r.action}</div></div><span style={{ fontSize: 10, color: "var(--gray3)" }}>{r.time}</span></div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: "3rem", fontSize: 13, color: "var(--gray3)" }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--cream)", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="12" height="12" fill="var(--coral)" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg></div>
            <span><b>Your data is secure. We never post on your behalf.</b></span>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className={`section lazy-section${lazyTestimonials.visible ? " visible" : ""}`} style={{ background: "#FFF8ED;"}} ref={lazyTestimonials.ref}>
        <div className="section-inner">
          <div style={{ textAlign: "center", maxWidth: 520, margin: "0 auto" }}>
            <span className="section-eyebrow">
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--coral)", display: "inline-block" }} />
              What developers say
            </span>
            <h2 className="section-title blur-reveal">
              Real results for <em>real developers</em>
            </h2>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((t) => (
              <div className="testimonial-card stagger-child" key={t.name}>
                <div className="quote-mark">&ldquo;</div>
                <p className="quote-text">{t.quote}</p>
                <div className="testimonial-footer">
                  <div className="t-avatar">{t.initials}</div>
                  <div>
                    <div className="t-name">{t.name}</div>
                    <div className="t-role">{t.role}</div>
                  </div>
                  <div className="t-score">{t.tier} {t.score}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SINGLE CTA: RECRUITER TEASER ─── */}
      <section className={`single-cta-section lazy-section${lazyDualCta.visible ? " visible" : ""}`} ref={lazyDualCta.ref}>
        <div className="single-cta-card">
          <div className="cta-bg-shape" style={{ width: 300, height: 300, background: "white", top: -100, right: -100 }} />
          <div className="cta-bg-shape" style={{ width: 220, height: 220, background: "white", bottom: -80, left: -80 }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <span style={{ background: "rgba(255,255,255,.08)", color: "rgba(255,255,255,.6)", fontSize: 11, fontWeight: 700, padding: "5px 14px", borderRadius: 50, display: "inline-block", marginBottom: "1.25rem", letterSpacing: ".06em", textTransform: "uppercase" as const, border: "1px solid rgba(255,255,255,.1)" }}>
              Hiring, not job-hunting?
            </span>
            <h3 className="single-cta-title">Antyl also works the other way around.</h3>
            <p className="single-cta-sub">If you&apos;re a recruiter or founder looking to hire, head over to the recruiter side to post a job and browse verified candidates.</p>
            <Link href="/recruiters" className="btn-cta-white">
              Go to recruiter page
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <Image src="/Antyl.png" alt="Antyl" width={60} height={60} style={{ marginBottom: "1rem" }} />
              <p className="footer-brand-desc">
                AI-powered developer verification and smart job matching. Built
                for engineers who want to prove their skills, not just list them.
              </p>
            </div>
            <div>
              <div className="footer-col-title">Product</div>
              <div className="footer-links">
                <a href="#how-it-works" className="footer-link">How it works</a>
                <a href="#antyl-score" className="footer-link">Antyl Score</a>
                <a href="#features" className="footer-link">Features</a>
              </div>
            </div>
            <div>
              <div className="footer-col-title">Developers</div>
              <div className="footer-links">
                <a href="/signup?role=developer" className="footer-link">Get verified</a>
                <a href="/signup?role=developer" className="footer-link">Job feed</a>
                <a href="/signup?role=developer" className="footer-link">Improve score</a>
              </div>
            </div>
            <div>
              <div className="footer-col-title">Recruiters</div>
              <div className="footer-links">
                <Link href="/recruiters" className="footer-link">Post a job</Link>
                <Link href="/recruiters" className="footer-link">Browse talent</Link>
                <Link href="/recruiters" className="footer-link">Plans</Link>
              </div>
            </div>
            <div id="contact">
              <div className="footer-col-title">Contact</div>
              <div className="footer-links">
                <a href="mailto:info@antyl.org" className="footer-link">info@antyl.org</a>
                <a href="tel:+918172836138" className="footer-link">+91-8172836138</a>
                <span className="footer-link" style={{ cursor: "default" }}>Koramangala, Bangalore, India</span>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>&copy; 2026 Antyl. All rights reserved.</span>
            <div className="footer-bottom-links">
              <a href="/privacy" className="footer-bottom-link">Privacy</a>
              <a href="/terms" className="footer-bottom-link">Terms</a>
              <a href="#contact" className="footer-bottom-link">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
