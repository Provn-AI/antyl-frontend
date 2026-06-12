"use client";

import React from "react";
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

  const carouselTestimonials = [
    {
      quote: "Got 3 interview calls in the first week — without applying to a single job manually.",
      name: "Arjun K.",
      role: "Frontend Engineer",
      company: "Razorpay",
      initials: "AK",
      score: 88,
      tier: "Expert",
      bg: "#FFE8E3",
      color: "#FF6B4D",
    },
    {
      quote: "The Trust Score is a game changer. I finally know who can actually do the job before I even call them.",
      name: "Nidhi S.",
      role: "Talent Lead",
      company: "Zomato",
      initials: "NS",
      score: null,
      tier: "Recruiter",
      bg: "#F3EFFE",
      color: "#8B5CF6",
    },
    {
      quote: "Provn proved my skills without a whiteboard test. My score opened doors I couldn't before.",
      name: "Priya S.",
      role: "Full-Stack Dev",
      company: "PhonePe",
      initials: "PS",
      score: 79,
      tier: "Advanced",
      bg: "#FFF4E3",
      color: "#FFB347",
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
    },
    {
      quote: "As a startup founder, filtering by Trust Score meant our first hire was genuinely excellent.",
      name: "Kavya R.",
      role: "Founder & CTO",
      company: "Buildfast",
      initials: "KR",
      score: null,
      tier: "Recruiter",
      bg: "#FFF0F2",
      color: "#FF7A8A",
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

        /* ---- TECH CAROUSEL ---- */
        .tech-carousel-section {
          padding: 3.5rem 0;
          overflow: hidden;
          background: var(--white);
          border-bottom: 1px solid var(--gray2);
          margin-top: 2.5rem;
        }
        .tech-carousel-label {
          text-align: center;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: var(--gray3);
          margin-bottom: 1.75rem;
        }
        .tech-marquee-wrap {
          position: relative;
          overflow: hidden;
        }
        .tech-marquee-wrap::before,
        .tech-marquee-wrap::after {
          content: '';
          position: absolute;
          top: 0; bottom: 0;
          width: 120px;
          z-index: 2;
          pointer-events: none;
        }
        .tech-marquee-wrap::before {
          left: 0;
          background: linear-gradient(to right, var(--white) 0%, transparent 100%);
        }
        .tech-marquee-wrap::after {
          right: 0;
          background: linear-gradient(to left, var(--white) 0%, transparent 100%);
        }
        .tech-marquee-track {
          display: flex;
          width: max-content;
          gap: 10px;
          padding: 6px 0;
          animation: techScrollRight 38s linear infinite;
        }
        .tech-marquee-wrap:hover .tech-marquee-track {
          animation-play-state: paused;
        }
        @keyframes techScrollRight {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
        .tech-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 20px;
          border-radius: 999px;
          border: 1px solid var(--gray2);
          background: var(--white);
          white-space: nowrap;
          cursor: default;
          transition: border-color .2s, transform .2s, box-shadow .2s;
          user-select: none;
        }
        .tech-pill:hover {
          border-color: var(--coral);
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 4px 16px rgba(255,107,77,.12);
        }
        .tech-pill-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          flex-shrink: 0;
        }
        .tech-pill span {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--ink);
          letter-spacing: -.01em;
        }

        /* ---- SOCIAL PROOF MARQUEE ---- */
        .proof-section {
          padding: 5rem 0;
          background: var(--gray1);
          border-top: 1px solid var(--gray2);
          border-bottom: 1px solid var(--gray2);
          overflow: hidden;
        }
        .proof-header {
          text-align: center;
          margin-bottom: 3rem;
          padding: 0 1.5rem;
        }
        .proof-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: var(--coral);
          margin-bottom: .875rem;
        }
        .proof-title {
          font-family: var(--serif);
          font-size: clamp(26px, 3vw, 38px);
          font-weight: 600;
          color: var(--ink);
          letter-spacing: -.03em;
          line-height: 1.15;
        }
        .proof-title em { font-style: italic; color: var(--coral); }
        .proof-marquee-wrap {
          position: relative;
          overflow: hidden;
        }
        .proof-marquee-wrap::before,
        .proof-marquee-wrap::after {
          content: '';
          position: absolute;
          top: 0; bottom: 0;
          width: 140px;
          z-index: 2;
          pointer-events: none;
        }
        .proof-marquee-wrap::before {
          left: 0;
          background: linear-gradient(to right, var(--gray1) 0%, transparent 100%);
        }
        .proof-marquee-wrap::after {
          right: 0;
          background: linear-gradient(to left, var(--gray1) 0%, transparent 100%);
        }
        .proof-marquee-track {
          display: flex;
          width: max-content;
          gap: 16px;
          padding: 8px 8px 16px;
          animation: proofScroll 50s linear infinite;
        }
        .proof-marquee-wrap:hover .proof-marquee-track {
          animation-play-state: paused;
        }
        @keyframes proofScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .proof-card {
          width: 300px;
          flex-shrink: 0;
          background: var(--white);
          border: 1px solid var(--gray2);
          border-radius: 20px;
          padding: 1.5rem;
          transition: transform .2s, box-shadow .2s;
          cursor: default;
        }
        .proof-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 36px rgba(0,0,0,.07);
        }
        .proof-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }
        .proof-avatar-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .proof-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .proof-name {
          font-size: 14px;
          font-weight: 700;
          color: var(--ink);
          letter-spacing: -.01em;
        }
        .proof-role {
          font-size: 11.5px;
          color: var(--gray3);
          margin-top: 1px;
        }
        .proof-score-badge {
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 50px;
          background: linear-gradient(90deg, #FF6B4D, #FFB347);
          color: white;
          flex-shrink: 0;
          white-space: nowrap;
        }
        .proof-recruiter-badge {
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 50px;
          background: var(--gray1);
          color: var(--gray4);
          border: 1px solid var(--gray2);
          flex-shrink: 0;
        }
        .proof-quote {
          font-size: 13.5px;
          color: var(--gray4);
          line-height: 1.65;
          font-style: italic;
          margin-bottom: 1rem;
        }
        .proof-card-footer {
          display: flex;
          align-items: center;
          gap: 6px;
          padding-top: .875rem;
          border-top: 1px solid var(--gray2);
        }
        .proof-company-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--coral);
          flex-shrink: 0;
        }
        .proof-company {
          font-size: 11.5px;
          font-weight: 700;
          color: var(--coral);
        }
        .proof-stars {
          margin-left: auto;
          display: flex;
          gap: 2px;
        }
        .proof-star {
          width: 11px; height: 11px;
          background: #FFD84D;
          clip-path: polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);
        }

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
          <Image src="/Antyl.png" alt="Antyl" width={50} height={50} />
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
      <section className="section" id="how-it-works" style={{ borderTop: "1px solid var(--gray2)" }}>
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

      {/* ─── TECH CAROUSEL & SOCIAL PROOF ─── */}
      <section className="tech-carousel-section">
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

      <section className="proof-section">
        <div className="proof-header">
          <div className="proof-eyebrow">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--coral)", display: "inline-block" }} />
            Trusted by thousands
          </div>
          <h2 className="proof-title">
            Real people. <em>Real results.</em>
          </h2>
        </div>
        <div className="proof-marquee-wrap">
          <div className="proof-marquee-track">
            {[...carouselTestimonials, ...carouselTestimonials].map((t, i) => (
              <div className="proof-card" key={i}>
                <div className="proof-card-top">
                  <div className="proof-avatar-wrap">
                    <div className="proof-avatar" style={{ background: t.bg, color: t.color }}>
                      {t.initials}
                    </div>
                    <div>
                      <div className="proof-name">{t.name}</div>
                      <div className="proof-role">{t.role}</div>
                    </div>
                  </div>
                  {t.score ? (
                    <div className="proof-score-badge">{t.tier} · {t.score}</div>
                  ) : (
                    <div className="proof-recruiter-badge">Recruiter</div>
                  )}
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
            ))}
          </div>
        </div>
      </section>

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