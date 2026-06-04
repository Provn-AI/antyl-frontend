"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [counted, setCounted] = useState(false);
  const [counts, setCounts] = useState({ devs: 0, companies: 0, match: 0 });
  const statsRef = useRef<HTMLDivElement>(null);

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
          animateCount("devs", 0, 12000, 1400);
          animateCount("companies", 0, 340, 1200);
          animateCount("match", 0, 87, 1000);
        }
      },
      { threshold: 0, rootMargin: "0px 0px -100px 0px" }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [counted]);

  const steps = [
    {
      num: "01",
      title: "Connect GitHub",
      desc: "Link your repos. Antyl's AI reads your actual code — not your resume.",
      color: "#FF6B4D",
      bg: "#FFF0ED",
    },
    {
      num: "02",
      title: "Get verified",
      desc: "Answer 7 questions about your own projects. Takes 30 minutes.",
      color: "#FFB347",
      bg: "#FFF8ED",
    },
    {
      num: "03",
      title: "Set preferences",
      desc: "Choose role, location, salary, and stack. Once. That's it.",
      color: "#FFD84D",
      bg: "#FFFBEE",
    },
    {
      num: "04",
      title: "Jobs come to you",
      desc: "Auto-apply runs every 6 hours. Wake up to real interview requests.",
      color: "#FF7A8A",
      bg: "#FFF0F2",
    },
  ];

  const testimonials = [
    {
      quote:
        "I got 3 interview calls in the first week without applying to a single job manually.",
      name: "Arjun Kumar",
      role: "Frontend Engineer · Hired at Razorpay",
      initials: "AK",
      score: 88,
      tier: "Expert",
    },
    {
      quote:
        "As a recruiter, the Trust Score is a game changer. I know exactly who can actually do the job.",
      name: "Nidhi Sharma",
      role: "Talent Lead · Zomato",
      initials: "NS",
      score: null,
      tier: null,
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
  ];

  const features = [
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
        </svg>
      ),
      title: "GitHub verified",
      desc: "AI asks you about your own code — no faking it. Your commits, your architecture decisions, your trade-offs.",
      color: "#FF6B4D",
      bg: "#FFF0ED",
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      ),
      title: "Auto-apply engine",
      desc: "Set your preferences once. Antyl applies to matching jobs every 6 hours — only above your match threshold.",
      color: "#FFB347",
      bg: "#FFF8ED",
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="6" />
          <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
        </svg>
      ),
      title: "Trust score badge",
      desc: "One score from 0–100 that tells the whole story. Carries across every job application on Antyl.",
      color: "#22C55E",
      bg: "#EAFAF0",
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      title: "Recruiter matching",
      desc: "Recruiters filter by Trust Score, skills, and location. Only verified developers appear in their feed.",
      color: "#8B5CF6",
      bg: "#F3EFFE",
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="3" y1="15" x2="21" y2="15" />
          <line x1="9" y1="3" x2="9" y2="21" />
          <line x1="15" y1="3" x2="15" y2="21" />
        </svg>
      ),
      title: "Kanban pipeline",
      desc: "Recruiters move candidates through stages. Developers see their application status in real time.",
      color: "#FF7A8A",
      bg: "#FFF0F2",
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      ),
      title: "Score improvements",
      desc: "After each session, get a precise breakdown: what to fix in your repos to move up to the next tier.",
      color: "#FFD84D",
      bg: "#FFFBEE",
    },
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

        body {
          font-family: var(--font);
          background: var(--white);
          color: var(--ink);
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }

        /* ---- NAVBAR ---- */
        .navbar {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2.5rem;
          transition: background .25s, box-shadow .25s;
        }
        .navbar.scrolled {
          background: rgba(255,255,255,0.88);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 1px 0 var(--gray2);
        }
        .nav-logo {
          font-family: var(--serif);
          font-size: 24px;
          font-weight: 600;
          background: var(--grad-90);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -.02em;
          text-decoration: none;
        }
        .nav-links { display: flex; gap: 2rem; align-items: center; }
        .nav-link {
          font-size: 14px; font-weight: 500; color: var(--gray4);
          text-decoration: none; letter-spacing: -.01em; transition: color .15s;
        }
        .nav-link:hover { color: var(--ink); }
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

        /* ---- HERO ---- */
        .hero {
          min-height: 100vh; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 7rem 1.5rem 4rem; text-align: center;
          position: relative; overflow: hidden; background: var(--white);
        }
        .hero-bg-blob {
          position: absolute; border-radius: 50%;
          filter: blur(80px); opacity: .12; pointer-events: none;
        }
        .blob-1 { width: 600px; height: 600px; background: var(--coral); top: -200px; left: -200px; }
        .blob-2 { width: 500px; height: 500px; background: var(--lemon); bottom: -100px; right: -150px; }
        .blob-3 { width: 300px; height: 300px; background: var(--amber); top: 40%; left: 50%; transform: translate(-50%,-50%); }

        .hero-eyebrow {
          display: inline-flex; align-items: center; gap: 7px;
          background: var(--cream); border: 1px solid var(--beige);
          color: var(--coral); font-size: 14px; font-weight: 700;
          padding: 8px 20px; border-radius: 50px; margin-bottom: 2rem;
          letter-spacing: .02em; animation: fadeUp .6s ease both;
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
          font-family: var(--serif); font-size: clamp(38px, 5.5vw, 60px);
          font-weight: 600; line-height: 1.1; color: var(--ink);
          max-width: 760px; letter-spacing: -.03em; margin-bottom: 1.25rem;
          animation: fadeUp .7s .1s ease both;
        }
        .hero-title em { font-style: italic; color: var(--coral); }
        .hero-sub {
          font-size: 17px; color: var(--gray4); max-width: 500px; line-height: 1.65;
          margin-bottom: 2.5rem; animation: fadeUp .7s .2s ease both; font-weight: 400;
        }
        .hero-ctas {
          display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;
          margin-bottom: 2.5rem; animation: fadeUp .7s .3s ease both;
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

        .hero-social-proof {
          display: flex; align-items: center; gap: .625rem; font-size: 13px;
          color: var(--gray3); animation: fadeUp .7s .45s ease both; margin-bottom: .75rem;
        }
        .proof-avatars { display: flex; }
        .proof-avatar {
          width: 28px; height: 28px; border-radius: 50%; border: 2px solid white;
          display: flex; align-items: center; justify-content: center;
          font-size: 9px; font-weight: 700; margin-left: -8px; flex-shrink: 0;
        }
        .proof-avatar:first-child { margin-left: 0; }
        .hero-badge-row {
          display: flex; gap: .75rem; justify-content: center; flex-wrap: wrap;
          animation: fadeUp .7s .5s ease both;
        }
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

        /* ---- STATS ---- */
        .stats-strip {
          border-top: 1px solid var(--gray2); border-bottom: 1px solid var(--gray2);
          background: var(--white); padding: 2.5rem 2rem;
        }
        .stats-inner {
          max-width: 800px; margin: 0 auto;
          display: flex; justify-content: center;
        }
        .stat-item {
          flex: 1; text-align: center; padding: 0 2rem; position: relative;
        }
        .stat-item:not(:last-child)::after {
          content: ''; position: absolute; right: 0; top: 50%;
          transform: translateY(-50%); height: 40px; width: 1px; background: var(--gray2);
        }
        .stat-number {
          font-family: var(--serif); font-size: 40px; font-weight: 600;
          color: var(--ink); line-height: 1; letter-spacing: -.03em;
        }
        .stat-suffix {
          background: var(--grad-90); -webkit-background-clip: text;
          -webkit-text-fill-color: transparent; background-clip: text;
        }
        .stat-label { font-size: 13px; color: var(--gray3); font-weight: 500; margin-top: .375rem; }

        /* ---- SECTIONS ---- */
        .section { padding: 6rem 1.5rem; }
        .section-inner { max-width: 1100px; margin: 0 auto; }
        .section-eyebrow {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 13px; font-weight: 700; letter-spacing: .1em;
          text-transform: uppercase; color: var(--coral); margin-bottom: 1rem;
        }
        .section-title {
          font-family: var(--serif); font-size: clamp(28px, 3.5vw, 42px);
          font-weight: 600; color: var(--ink); line-height: 1.15;
          letter-spacing: -.03em; margin-bottom: 1rem;
        }
        .section-title em { font-style: italic; color: var(--coral); }
        .section-sub { font-size: 16px; color: var(--gray4); line-height: 1.65; max-width: 500px; }

        /* ---- HOW IT WORKS ---- */
        .steps-grid {
          display: grid; grid-template-columns: repeat(4,1fr);
          gap: 1.25rem; margin-top: 3.5rem;
        }
        .step-card {
          background: var(--white); border: 1px solid var(--gray2);
          border-radius: 20px; padding: 1.75rem 1.5rem; position: relative;
          transition: transform .2s, box-shadow .2s, border-color .2s;
        }
        .step-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0,0,0,.07);
          border-color: var(--coral);
        }
        .step-num {
          font-family: var(--serif); font-size: 11px; font-weight: 600;
          letter-spacing: .1em; color: var(--gray3); margin-bottom: 1rem; text-transform: uppercase;
        }
        .step-icon-wrap {
          width: 48px; height: 48px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center; margin-bottom: 1rem;
        }
        .step-title { font-size: 16px; font-weight: 700; color: var(--ink); margin-bottom: .5rem; letter-spacing: -.02em; }
        .step-desc { font-size: 13.5px; color: var(--gray4); line-height: 1.6; }
        .step-connector {
          position: absolute; right: -14px; top: 50%; transform: translateY(-50%);
          width: 28px; height: 28px; background: var(--white);
          border: 1.5px solid var(--gray2); border-radius: 50%;
          display: flex; align-items: center; justify-content: center; z-index: 1;
        }

        /* ---- FEATURES ---- */
        .features-grid {
          display: grid; grid-template-columns: repeat(3,1fr);
          gap: 1rem; margin-top: 3.5rem;
        }
        .feature-card {
          background: var(--gray1); border: 1px solid var(--gray2);
          border-radius: 20px; padding: 1.75rem;
          transition: transform .2s, box-shadow .2s, background .2s;
        }
        .feature-card:hover {
          transform: translateY(-3px); box-shadow: 0 8px 32px rgba(0,0,0,.06);
          background: var(--white);
        }
        .feature-icon {
          width: 46px; height: 46px; border-radius: 13px;
          display: flex; align-items: center; justify-content: center; margin-bottom: 1.125rem;
        }
        .feature-title { font-size: 16px; font-weight: 700; color: var(--ink); margin-bottom: .5rem; letter-spacing: -.02em; }
        .feature-desc { font-size: 13.5px; color: var(--gray4); line-height: 1.65; }

        /* ---- TRUST SCORE ---- */
        .score-section {
          background: var(--gray1); padding: 6rem 1.5rem;
          border-top: 1px solid var(--gray2); border-bottom: 1px solid var(--gray2);
        }
        .score-card {
          background: var(--white); border: 1px solid var(--gray2);
          border-radius: 24px; padding: 2.5rem; max-width: 900px; margin: 3.5rem auto 0;
          display: grid; grid-template-columns: 220px 1fr; gap: 3rem; align-items: center;
        }
        .score-ring-outer {
          width: 160px; height: 160px; border-radius: 50%;
          background: linear-gradient(135deg,#FF6B4D,#FFB347,#FFD84D);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 12px 40px rgba(255,107,77,.25); margin: 0 auto;
        }
        .score-ring-inner {
          width: 120px; height: 120px; border-radius: 50%; background: var(--white);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
        }
        .score-big {
          font-family: var(--serif); font-size: 44px; font-weight: 700;
          line-height: 1; color: var(--ink); letter-spacing: -.04em;
        }
        .score-label { font-size: 11px; font-weight: 700; color: var(--gray3); letter-spacing: .05em; text-transform: uppercase; }
        .score-tier {
          background: linear-gradient(90deg,#FF6B4D,#FFB347); color: white;
          font-size: 11px; font-weight: 700; padding: 4px 14px; border-radius: 50px;
          display: inline-block; margin-top: .75rem; letter-spacing: .04em; text-transform: uppercase;
        }
        .bars-wrap { display: flex; flex-direction: column; gap: .875rem; }
        .bar-row { display: flex; flex-direction: column; gap: 6px; }
        .bar-meta { display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; color: var(--ink); }
        .bar-pct { color: var(--gray3); }
        .bar-track { height: 8px; background: var(--gray2); border-radius: 4px; overflow: hidden; }
        .bar-fill {
          height: 100%; border-radius: 4px;
          background: linear-gradient(90deg,#FF6B4D,#FFB347);
          transition: width 1.2s cubic-bezier(.22,1,.36,1);
        }
        .tiers-row { display: flex; gap: .5rem; margin-top: 1.5rem; flex-wrap: wrap; }
        .tier-chip {
          font-size: 11px; font-weight: 600; padding: 4px 12px;
          border-radius: 50px; border: 1.5px solid var(--gray2); color: var(--gray3);
        }
        .tier-chip.active { border-color: var(--coral); background: var(--cream); color: var(--coral); }

        /* ---- TESTIMONIALS ---- */
        .testimonials-grid {
          display: grid; grid-template-columns: repeat(3,1fr);
          gap: 1.25rem; margin-top: 3.5rem;
        }
        .testimonial-card {
          background: var(--white); border: 1px solid var(--gray2);
          border-radius: 20px; padding: 1.75rem;
          transition: transform .2s, box-shadow .2s;
        }
        .testimonial-card:hover { transform: translateY(-3px); box-shadow: 0 8px 32px rgba(0,0,0,.06); }
        .quote-mark { font-family: var(--serif); font-size: 48px; line-height: .8; color: var(--beige); margin-bottom: .5rem; font-style: italic; }
        .quote-text { font-size: 14.5px; color: var(--ink); line-height: 1.65; margin-bottom: 1.25rem; }
        .testimonial-footer { display: flex; align-items: center; gap: .75rem; }
        .t-avatar {
          width: 40px; height: 40px; border-radius: 50%;
          background: var(--cream); border: 2px solid var(--beige);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; color: var(--coral); flex-shrink: 0;
        }
        .t-name { font-size: 13px; font-weight: 700; color: var(--ink); }
        .t-role { font-size: 11px; color: var(--gray3); margin-top: 2px; }
        .t-score {
          margin-left: auto; flex-shrink: 0;
          background: linear-gradient(90deg,#FF6B4D,#FFB347); color: white;
          font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 50px;
        }

        /* ---- DUAL CTA ---- */
        .dual-cta-section { padding: 6rem 1.5rem; background: var(--white); }
        .dual-cta-grid {
          max-width: 1000px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem;
        }
        .cta-card { border-radius: 24px; padding: 2.5rem; position: relative; overflow: hidden; }
        .cta-card-dev { background: linear-gradient(135deg,#FF6B4D,#FFB347); color: white; }
        .cta-card-rec { background: var(--ink); color: white; }
        .cta-card-title {
          font-family: var(--serif); font-size: 26px; font-weight: 600;
          line-height: 1.2; margin-bottom: .625rem; letter-spacing: -.03em;
        }
        .cta-card-sub { font-size: 14px; opacity: .8; line-height: 1.6; margin-bottom: 2rem; max-width: 320px; }
        .btn-cta-white {
          background: white; color: var(--coral); border: none;
          padding: 12px 28px; border-radius: 50px; font-size: 14px; font-weight: 700;
          cursor: pointer; font-family: var(--font); letter-spacing: -.01em;
          transition: transform .15s, box-shadow .15s;
          text-decoration: none; display: inline-flex; align-items: center; gap: 7px;
        }
        .btn-cta-white:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,.15); }
        .btn-cta-outline {
          background: transparent; color: white; border: 1.5px solid rgba(255,255,255,.4);
          padding: 12px 28px; border-radius: 50px; font-size: 14px; font-weight: 700;
          cursor: pointer; font-family: var(--font); letter-spacing: -.01em;
          transition: border-color .15s, transform .15s;
          text-decoration: none; display: inline-flex; align-items: center; gap: 7px;
        }
        .btn-cta-outline:hover { border-color: rgba(255,255,255,.8); transform: translateY(-2px); }
        .cta-bg-shape { position: absolute; border-radius: 50%; opacity: .08; pointer-events: none; }

        /* ---- FOOTER ---- */
        .footer { background: var(--ink); color: white; padding: 3.5rem 2.5rem 2rem; }
        .footer-inner { max-width: 1100px; margin: 0 auto; }
        .footer-top {
          display: flex; justify-content: space-between; gap: 3rem;
          padding-bottom: 2.5rem; border-bottom: 1px solid rgba(255,255,255,.08); flex-wrap: wrap;
        }
        .footer-brand { max-width: 260px; }
        .footer-logo {
          font-family: var(--serif); font-size: 22px; font-weight: 600;
          background: linear-gradient(90deg,#FF6B4D,#FFB347);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; margin-bottom: 1rem; display: block;
        }
        .footer-brand-desc { font-size: 13px; color: rgba(255,255,255,.45); line-height: 1.65; }
        .footer-col-title {
          font-size: 11px; font-weight: 700; text-transform: uppercase;
          letter-spacing: .1em; color: rgba(255,255,255,.35); margin-bottom: 1rem;
        }
        .footer-links { display: flex; flex-direction: column; gap: .625rem; }
        .footer-link { font-size: 13.5px; color: rgba(255,255,255,.6); text-decoration: none; transition: color .15s; }
        .footer-link:hover { color: white; }
        .footer-bottom {
          display: flex; justify-content: space-between; align-items: center;
          padding-top: 2rem; font-size: 12px; color: rgba(255,255,255,.3);
          flex-wrap: wrap; gap: .75rem;
        }
        .footer-bottom-links { display: flex; gap: 1.5rem; }
        .footer-bottom-link { color: rgba(255,255,255,.3); text-decoration: none; font-size: 12px; transition: color .15s; }
        .footer-bottom-link:hover { color: rgba(255,255,255,.7); }

        /* ---- RESPONSIVE ---- */
        @media (max-width: 900px) {
          .nav-links { display: none; }
          .steps-grid { grid-template-columns: repeat(2,1fr); }
          .features-grid { grid-template-columns: repeat(2,1fr); }
          .score-card { grid-template-columns: 1fr; text-align: center; }
          .testimonials-grid { grid-template-columns: 1fr; }
          .dual-cta-grid { grid-template-columns: 1fr; }
          .step-connector { display: none; }
        }
        @media (max-width: 600px) {
          .navbar { padding: 0 1.25rem; }
          .hero { padding: 6rem 1.25rem 3rem; }
          .steps-grid { grid-template-columns: 1fr; }
          .features-grid { grid-template-columns: 1fr; }
          .stats-inner { flex-direction: column; gap: 2rem; }
          .stat-item::after { display: none; }
        }
      `}</style>

      {/* ─── NAVBAR ─── */}
      <nav className={`navbar${scrolled ? " scrolled" : ""}`}>
        <Link href='/' style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <Image src="/Antyl.svg" alt="Antyl" width={50} height={50} />
        </Link>
        <div className="nav-links">
          <a href="#how-it-works" className="nav-link">How it works</a>
          <a href="#features" className="nav-link">Features</a>
          <a href="#trust-score" className="nav-link">Trust Score</a>
          <a href="#for-recruiters" className="nav-link">For recruiters</a>
        </div>
        <div className="nav-actions">
          <a href="/login" className="btn-ghost-nav">Log in</a>
          <a href="/signup" className="btn-primary-nav">Get started free</a>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="hero">
        <div className="hero-bg-blob blob-1" />
        <div className="hero-bg-blob blob-2" />
        <div className="hero-bg-blob blob-3" />

        <div className="hero-eyebrow">
          <span className="eyebrow-dot" />
          AI-powered developer verification
        </div>

        <h1 className="hero-title">
          Jobs that actually match.
          <br />
          Skills that actually <em>prove themselves.</em>
        </h1>

        <p className="hero-sub">
          Antyl verifies developers with AI, then auto-applies you to matching
          roles. No ghosting, no guessing — just your next job.
        </p>

        <div className="hero-ctas">
          <a href="/signup?role=developer" className="btn-hero-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
            </svg>
            Start free as a developer
          </a>
          <a href="/signup?role=recruiter" className="btn-hero-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Hire verified talent
          </a>
        </div>

        <div className="hero-social-proof">
          <div className="proof-avatars">
            {[
              { initials: "AK", bg: "#FFE8E3", color: "#FF6B4D" },
              { initials: "PS", bg: "#FFF4E3", color: "#FFB347" },
              { initials: "VR", bg: "#F3EFFE", color: "#8B5CF6" },
              { initials: "NR", bg: "#EAFAF0", color: "#22C55E" },
            ].map((a) => (
              <div key={a.initials} className="proof-avatar" style={{ background: a.bg, color: a.color }}>
                {a.initials}
              </div>
            ))}
          </div>
          Join 12,000+ verified developers already on Antyl
        </div>

        <div className="hero-badge-row" style={{ marginTop: "1rem" }}>
          <span className="hero-badge">
            <span className="hero-badge-dot" style={{ background: "#22C55E" }} />
            No whiteboard tests
          </span>
          <span className="hero-badge">
            <span className="hero-badge-dot" style={{ background: "#FF6B4D" }} />
            Auto-apply engine
          </span>
          <span className="hero-badge">
            <span className="hero-badge-dot" style={{ background: "#FFB347" }} />
            Free for developers
          </span>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="section" id="how-it-works">
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
              verified, set preferences, and let the engine run.
            </p>
          </div>

          <div className="steps-grid">
            {steps.map((step, i) => (
              <div className="step-card" key={step.num}>
                <div className="step-num">{step.num}</div>
                <div className="step-icon-wrap" style={{ background: step.bg, color: step.color }}>
                  {i === 0 && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                    </svg>
                  )}
                  {i === 1 && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  )}
                  {i === 2 && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" /><path d="M4.93 4.93a10 10 0 0 0 0 14.14" />
                    </svg>
                  )}
                  {i === 3 && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
                    </svg>
                  )}
                </div>
                <div className="step-title">{step.title}</div>
                <p className="step-desc">{step.desc}</p>
                {i < steps.length - 1 && (
                  <div className="step-connector">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--gray3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <div className="stats-strip" ref={statsRef}>
        <div className="stats-inner">
          <div className="stat-item">
            <div className="stat-number">
              {counts.devs >= 1000
                ? `${(counts.devs / 1000).toFixed(counts.devs >= 10000 ? 0 : 1)}k`
                : counts.devs}
              <span className="stat-suffix">+</span>
            </div>
            <div className="stat-label">Verified developers</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">
              {counts.companies}<span className="stat-suffix">+</span>
            </div>
            <div className="stat-label">Companies hiring</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">
              {counts.match}<span className="stat-suffix">%</span>
            </div>
            <div className="stat-label">Match accuracy</div>
          </div>
        </div>
      </div>

      {/* ─── TRUST SCORE ─── */}
      <section className="score-section" id="trust-score">
        <div className="section-inner">
          <div style={{ textAlign: "center", maxWidth: 560, margin: "0 auto" }}>
            <span className="section-eyebrow">
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--coral)", display: "inline-block" }} />
              Trust Score
            </span>
            <h2 className="section-title">
              One number that tells <em>the whole story</em>
            </h2>
            <p className="section-sub" style={{ margin: "0 auto" }}>
              After verification, you get a score from 0–100 across 4
              dimensions. It lives on your profile and updates with every
              session.
            </p>
          </div>

          <div className="score-card">
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div className="score-ring-outer">
                <div className="score-ring-inner">
                  <span className="score-big">78</span>
                  <span className="score-label">score</span>
                </div>
              </div>
              <div className="score-tier">Advanced</div>
              <p style={{ fontSize: 12, color: "var(--gray3)", marginTop: ".75rem", textAlign: "center" }}>
                Top 18% of developers
              </p>
            </div>

            <div>
              <div className="bars-wrap">
                {[
                  { label: "Technical depth", pct: 82 },
                  { label: "Code quality", pct: 74 },
                  { label: "Project complexity", pct: 80 },
                  { label: "Communication", pct: 68 },
                ].map((b) => (
                  <div className="bar-row" key={b.label}>
                    <div className="bar-meta">
                      <span>{b.label}</span>
                      <span className="bar-pct">{b.pct}%</span>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: counted ? `${b.pct}%` : "0%" }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="tiers-row">
                {[
                  { label: "Beginner  0–40", active: false },
                  { label: "Mid  41–65", active: false },
                  { label: "Advanced  66–85", active: true },
                  { label: "Expert  86–100", active: false },
                ].map((t) => (
                  <span key={t.label} className={`tier-chip${t.active ? " active" : ""}`}>
                    {t.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="section" id="features">
        <div className="section-inner">
          <div style={{ maxWidth: 560 }}>
            <span className="section-eyebrow">
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--coral)", display: "inline-block" }} />
              Everything included
            </span>
            <h2 className="section-title">
              Built for how <em>real hiring</em> works
            </h2>
            <p className="section-sub">
              Every feature is designed to remove friction — for developers who
              are tired of the process and recruiters who need signal, not noise.
            </p>
          </div>
          <div className="features-grid">
            {features.map((f) => (
              <div className="feature-card" key={f.title}>
                <div className="feature-icon" style={{ background: f.bg, color: f.color }}>{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="section" style={{ background: "var(--gray1)", borderTop: "1px solid var(--gray2)" }}>
        <div className="section-inner">
          <div style={{ textAlign: "center", maxWidth: 520, margin: "0 auto" }}>
            <span className="section-eyebrow">
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--coral)", display: "inline-block" }} />
              What people say
            </span>
            <h2 className="section-title">
              Real results for <em>real developers</em>
            </h2>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((t) => (
              <div className="testimonial-card" key={t.name}>
                <div className="quote-mark"></div>
                <p className="quote-text">{t.quote}</p>
                <div className="testimonial-footer">
                  <div className="t-avatar">{t.initials}</div>
                  <div>
                    <div className="t-name">{t.name}</div>
                    <div className="t-role">{t.role}</div>
                  </div>
                  {t.score && (
                    <div className="t-score">{t.tier} {t.score}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DUAL CTA ─── */}
      <section className="dual-cta-section" id="for-recruiters">
        <div className="dual-cta-grid">
          <div className="cta-card cta-card-dev">
            <div className="cta-bg-shape" style={{ width: 300, height: 300, background: "white", top: -100, right: -100 }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <span style={{ background: "rgba(255,255,255,.2)", color: "white", fontSize: 11, fontWeight: 700, padding: "5px 14px", borderRadius: 50, display: "inline-block", marginBottom: "1.25rem", letterSpacing: ".06em", textTransform: "uppercase" as const }}>
                For developers
              </span>
              <h3 className="cta-card-title">Your skills deserve a fair shot.</h3>
              <p className="cta-card-sub">Get verified in 30 minutes. Never write a cold cover letter again.</p>
              <a href="/signup?role=developer" className="btn-cta-white">
                Start free
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </a>
            </div>
          </div>
          <div className="cta-card cta-card-rec">
            <div className="cta-bg-shape" style={{ width: 300, height: 300, background: "white", top: -100, right: -100 }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <span style={{ background: "rgba(255,255,255,.08)", color: "rgba(255,255,255,.6)", fontSize: 11, fontWeight: 700, padding: "5px 14px", borderRadius: 50, display: "inline-block", marginBottom: "1.25rem", letterSpacing: ".06em", textTransform: "uppercase" as const, border: "1px solid rgba(255,255,255,.1)" }}>
                For recruiters
              </span>
              <h3 className="cta-card-title">Hire people who can actually do the job.</h3>
              <p className="cta-card-sub">Filter by Trust Score. Every candidate you see is already verified.</p>
              <a href="/signup?role=recruiter" className="btn-cta-outline">
                Post a job
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <Image src="/Antyl.svg" alt="Antyl" width={60} height={60} style={{ marginBottom: "1rem" }} />
              <p className="footer-brand-desc">
                AI-powered developer verification and smart job matching. Built
                for engineers who want to prove their skills, not just list them.
              </p>
            </div>
            <div>
              <div className="footer-col-title">Product</div>
              <div className="footer-links">
                <a href="#how-it-works" className="footer-link">How it works</a>
                <a href="#trust-score" className="footer-link">Trust Score</a>
                <a href="#features" className="footer-link">Features</a>
                <a href="/pricing" className="footer-link">Pricing</a>
              </div>
            </div>
            <div>
              <div className="footer-col-title">Developers</div>
              <div className="footer-links">
                <a href="/signup" className="footer-link">Get verified</a>
                <a href="/feed" className="footer-link">Job feed</a>
                <a href="/score" className="footer-link">Improve score</a>
              </div>
            </div>
            <div>
              <div className="footer-col-title">Recruiters</div>
              <div className="footer-links">
                <a href="/signup?role=recruiter" className="footer-link">Post a job</a>
                <a href="/candidates" className="footer-link">Browse talent</a>
                <a href="/billing" className="footer-link">Plans</a>
              </div>
            </div>
            <div>
              <div className="footer-col-title">Contact</div>
              <div className="footer-links">
                <a href="mailto:info@antyl.org" className="footer-link">info@antyl.org</a>
                <a href="tel:+918172836138" className="footer-link">+91-8172836138</a>
                <span className="footer-link" style={{ cursor: "default" }}>Koramangala, Bangalore, India</span>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 Antyl. All rights reserved.</span>
            <div className="footer-bottom-links">
              <a href="/privacy" className="footer-bottom-link">Privacy</a>
              <a href="/terms" className="footer-bottom-link">Terms</a>
              <a href="/contact" className="footer-bottom-link">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}