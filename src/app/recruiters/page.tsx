"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { submitDemoRequest } from "@/services/demo.request.service";

function useLazySection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { setVisible(entry.isIntersecting); },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}

export default function RecruiterLandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [counted, setCounted] = useState(false);
  const [counts, setCounts] = useState({ devs: 0, companies: 0, match: 0 });
  const statsRef = useRef<HTMLDivElement>(null);
  const lazyHero = useLazySection();
  const lazyHowItWorks = useLazySection();
  const lazyStats = useLazySection();
  const lazyScore = useLazySection();
  const [scoreCount, setScoreCount] = useState(0);
  const scoreAnimated = useRef(false);
  const lazyFeatures = useLazySection();
  const lazyTestimonials = useLazySection();
  const lazyDemo = useLazySection();
  const lazyDualCta = useLazySection();

  const [demoForm, setDemoForm] = useState({ name: "", work_email: "", company: "", phone: "", team_size: "", message: "" });
  const [demoStatus, setDemoStatus] = useState<"idle"|"loading"|"success"|"error">("idle");
  const handleDemoChange = (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) => { setDemoForm((prev) => ({ ...prev, [e.target.name]: e.target.value })); };
  const handleDemoSubmit = async (e: React.FormEvent) => { e.preventDefault(); setDemoStatus("loading"); try { await submitDemoRequest(demoForm); setDemoStatus("success"); setDemoForm({ name:"",work_email:"",company:"",phone:"",team_size:"",message:"" }); } catch { setDemoStatus("error"); } };

  useEffect(() => { const h = () => setScrolled(window.scrollY > 20); window.addEventListener("scroll", h); return () => window.removeEventListener("scroll", h); }, []);

  const animateCount = (key: "devs"|"companies"|"match", from: number, to: number, duration: number) => { const start = performance.now(); const tick = (now: number) => { const p = Math.min((now-start)/duration,1); const ease = 1-Math.pow(1-p,3); setCounts(prev=>({...prev,[key]:Math.floor(from+(to-from)*ease)})); if(p<1) requestAnimationFrame(tick); }; requestAnimationFrame(tick); };
  useEffect(() => { const obs = new IntersectionObserver(([e])=>{ if(e.isIntersecting&&!counted){setCounted(true);animateCount("devs",0,12000,1400);animateCount("companies",0,340,1200);animateCount("match",0,87,1000);} },{threshold:0,rootMargin:"0px 0px -100px 0px"}); if(statsRef.current) obs.observe(statsRef.current); return()=>obs.disconnect(); }, [counted]);

  useEffect(() => { if(lazyScore.visible&&!scoreAnimated.current){scoreAnimated.current=true;const target=78,duration=1800,start=performance.now();const tick=(now:number)=>{const p=Math.min((now-start)/duration,1);const ease=1-Math.pow(1-p,3);setScoreCount(Math.floor(target*ease));if(p<1)requestAnimationFrame(tick);else setScoreCount(target);};requestAnimationFrame(tick);} }, [lazyScore.visible]);

  const steps = [
    { num:"01", title:"Post a job", desc:"Describe the role, stack, and level. Takes under 5 minutes.", color:"#FF6B4D", bg:"#FFF0ED" },
    { num:"02", title:"Get matched candidates", desc:"Antyl surfaces GitHub-verified developers whose skills fit the role.", color:"#FFB347", bg:"#FFF8ED" },
    { num:"03", title:"Filter by Antyl Score", desc:"Set a minimum score threshold. Only see who clears the bar.", color:"#FFD84D", bg:"#FFFBEE" },
    { num:"04", title:"Move through pipeline", desc:"Track every applicant on a kanban board, from applied to hired.", color:"#FF7A8A", bg:"#FFF0F2" },
  ];

  const testimonials = [
    { quote:"The Antyl Score is a game changer. I know exactly who can actually do the job before I even call them.", name:"Nidhi Sharma", role:"Talent Lead · Zomato", initials:"NS" },
    { quote:"As a startup founder, filtering by Antyl Score meant our first hire was genuinely excellent.", name:"Kavya R.", role:"Founder & CTO · Buildfast", initials:"KR" },
    { quote:"We cut our screening time in half. Every candidate that reaches us has already proven their code.", name:"Arjun Mehta", role:"Engineering Manager · CRED", initials:"AM" },
  ];

  const scoreDimensions = [{ label:"Technical depth",value:82 },{ label:"Code quality",value:74 },{ label:"Project complexity",value:80 },{ label:"Communication",value:68 }];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,600&display=swap');
        :root{--coral:#FF6B4D;--amber:#FFB347;--lemon:#FFD84D;--pink:#FF7A8A;--cream:#FFF6EE;--beige:#FDE9D2;--ink:#1A1A1A;--white:#FFFFFF;--gray1:#F8F5F0;--gray2:#E8E4DF;--gray3:#B0A89E;--gray4:#6B6560;--grad:linear-gradient(135deg,#FF6B4D,#FFB347,#FFD84D);--grad-90:linear-gradient(90deg,#FF6B4D,#FFB347);--font:'DM Sans',sans-serif;--serif:'Fraunces',serif;}
        *{box-sizing:border-box;margin:0;padding:0;}html{scroll-behavior:smooth;}body{font-family:var(--font);background:var(--white);color:var(--ink);-webkit-font-smoothing:antialiased;overflow-x:hidden;}

        .lazy-section{opacity:0;transform:translateY(40px) scale(0.98);transition:opacity .8s cubic-bezier(.22,1,.36,1),transform .8s cubic-bezier(.22,1,.36,1);}
        .lazy-section.visible{opacity:1;transform:translateY(0) scale(1);}
        .lazy-section .stagger-child{opacity:0;transform:translateY(30px);transition:opacity .6s cubic-bezier(.22,1,.36,1),transform .6s cubic-bezier(.22,1,.36,1);}
        .lazy-section.visible .stagger-child:nth-child(1){opacity:1;transform:translateY(0);transition-delay:.1s;}
        .lazy-section.visible .stagger-child:nth-child(2){opacity:1;transform:translateY(0);transition-delay:.2s;}
        .lazy-section.visible .stagger-child:nth-child(3){opacity:1;transform:translateY(0);transition-delay:.3s;}
        .lazy-section.visible .stagger-child:nth-child(4){opacity:1;transform:translateY(0);transition-delay:.4s;}
        .lazy-section.visible .stagger-child:nth-child(5){opacity:1;transform:translateY(0);transition-delay:.5s;}
        .lazy-section.visible .stagger-child:nth-child(6){opacity:1;transform:translateY(0);transition-delay:.6s;}
        .lazy-section .blur-reveal{opacity:0;filter:blur(8px);transform:translateY(20px);transition:opacity .8s ease,filter .8s ease,transform .8s ease;}
        .lazy-section.visible .blur-reveal{opacity:1;filter:blur(0);transform:translateY(0);}
        .lazy-section .scale-up{opacity:0;transform:scale(0.85);transition:opacity .7s cubic-bezier(.22,1,.36,1),transform .7s cubic-bezier(.22,1,.36,1);}
        .lazy-section.visible .scale-up{opacity:1;transform:scale(1);transition-delay:.2s;}

        .navbar{position:fixed;top:0;left:0;right:0;z-index:100;height:64px;display:flex;align-items:center;justify-content:space-between;padding:0 2.5rem;transition:background .25s,box-shadow .25s;}
        .navbar.scrolled{background:rgba(255,255,255,0.88);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);box-shadow:0 1px 0 var(--gray2);}
        .nav-links{display:flex;gap:2rem;align-items:center;}.nav-link{position:relative;font-size:14px;font-weight:500;color:var(--gray4);text-decoration:none;padding-bottom:2px;transition:color .15s;}.nav-link::after{content:'';position:absolute;left:0;bottom:-3px;width:0;height:2px;border-radius:2px;background:var(--grad-90);transition:width .2s ease;}.nav-link:hover{color:var(--ink);}.nav-link:hover::after{width:100%;}
        .nav-actions{display:flex;gap:.625rem;align-items:center;}
        .btn-ghost-nav{background:transparent;color:var(--ink);border:1.5px solid var(--gray2);padding:8px 20px;border-radius:50px;font-size:13.5px;font-weight:600;cursor:pointer;font-family:var(--font);transition:border-color .15s;text-decoration:none;display:inline-flex;align-items:center;}.btn-ghost-nav:hover{border-color:var(--coral);color:var(--coral);}
        .btn-primary-nav{background:var(--coral);color:white;border:none;padding:9px 22px;border-radius:50px;font-size:13.5px;font-weight:700;cursor:pointer;font-family:var(--font);transition:background .15s,box-shadow .15s;text-decoration:none;display:inline-flex;align-items:center;}.btn-primary-nav:hover{background:#E5542F;box-shadow:0 4px 16px rgba(255,107,77,.3);}

        .hero{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:7rem 2.5rem 4rem;position:relative;overflow:hidden;background:var(--white);}
        .hero-bg-blob{position:absolute;border-radius:50%;filter:blur(80px);opacity:.12;pointer-events:none;}.blob-1{width:600px;height:600px;background:var(--coral);top:-200px;left:-200px;}.blob-2{width:500px;height:500px;background:var(--lemon);bottom:-100px;right:-150px;}.blob-3{width:300px;height:300px;background:var(--amber);top:40%;left:50%;transform:translate(-50%,-50%);}
        .hero-inner{display:flex;align-items:center;gap:4rem;max-width:1200px;margin:0 auto;width:100%;position:relative;z-index:1;}
        .hero-content{flex:1;text-align:left;}
        .hero-image-wrap{flex:0 0 480px;position:relative;display:flex;align-items:center;justify-content:center;background:transparent;}
        .hero-image-blob{position:absolute;width:440px;height:440px;border-radius:50%;background:var(--beige);top:50%;left:50%;transform:translate(-50%,-50%);z-index:0;}
        .hero-image-wrap img{position:relative;z-index:1;object-fit:cover;border-radius:0;background:transparent;}
        .hero-eyebrow{display:inline-flex;align-items:center;gap:7px;background:var(--cream);border:1px solid var(--beige);color:var(--coral);font-size:14px;font-weight:700;padding:8px 20px;border-radius:50px;margin-bottom:2rem;}
        .eyebrow-dot{width:8px;height:8px;border-radius:50%;background:var(--coral);animation:pulse 2s ease infinite;}@keyframes pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.5;transform:scale(.7);}}
        .hero-title{font-family:var(--serif);font-size:clamp(34px,4.5vw,54px);font-weight:600;line-height:1.1;color:var(--ink);max-width:580px;letter-spacing:-.03em;margin-bottom:1.25rem;}.hero-title em{font-style:italic;color:var(--coral);}
        .hero-sub{font-size:16px;color:var(--gray4);max-width:480px;line-height:1.65;margin-bottom:2rem;}.hero-sub strong{color:var(--ink);font-weight:700;}
        .hero-ctas{display:flex;gap:1rem;flex-wrap:wrap;margin-bottom:1.5rem;}
        .btn-hero-primary{background:linear-gradient(135deg,#FF6B4D,#FFB347);color:white;border:none;padding:15px 34px;border-radius:50px;font-size:15px;font-weight:700;cursor:pointer;font-family:var(--font);transition:transform .15s,box-shadow .15s;box-shadow:0 4px 20px rgba(255,107,77,.25);text-decoration:none;display:inline-flex;align-items:center;gap:8px;}.btn-hero-primary:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(255,107,77,.35);}
        .btn-hero-secondary{background:transparent;color:var(--ink);border:1.5px solid var(--gray2);padding:15px 34px;border-radius:50px;font-size:15px;font-weight:600;cursor:pointer;font-family:var(--font);transition:border-color .15s,transform .15s;text-decoration:none;display:inline-flex;align-items:center;gap:8px;}.btn-hero-secondary:hover{border-color:var(--ink);transform:translateY(-2px);}
        .hero-dev-link{font-size:13px;color:var(--gray3);margin-bottom:1.25rem;}.hero-dev-link a{color:var(--coral);font-weight:700;text-decoration:none;}
        .hero-social-proof{display:flex;align-items:center;gap:.625rem;font-size:13px;color:var(--gray3);margin-bottom:.75rem;}
        .proof-avatars{display:flex;}.proof-avatar{width:28px;height:28px;border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;margin-left:-8px;flex-shrink:0;}.proof-avatar:first-child{margin-left:0;}
        .hero-badge-row{display:flex;gap:.75rem;flex-wrap:wrap;}.hero-badge{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;color:var(--gray4);background:var(--gray1);padding:5px 12px;border-radius:50px;border:1px solid var(--gray2);}.hero-badge-dot{width:6px;height:6px;border-radius:50%;}

        .section{padding:6rem 1.5rem;}.section-inner{max-width:1100px;margin:0 auto;}
        .section-eyebrow{display:inline-flex;align-items:center;gap:6px;font-size:16px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--coral);margin-bottom:1rem;}
        .section-title{font-family:var(--serif);font-size:clamp(28px,3.5vw,42px);font-weight:600;color:var(--ink);line-height:1.15;letter-spacing:-.03em;margin-bottom:1rem;}.section-title em{font-style:italic;color:var(--coral);}
        .section-sub{font-size:16px;color:var(--gray4);line-height:1.65;max-width:500px;}

        .steps-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1.25rem;margin-top:3.5rem;}
        .step-card{background:var(--white);border:1px solid var(--gray2);border-radius:20px;padding:1.75rem 1.5rem;position:relative;transition:transform .2s,box-shadow .2s,border-color .2s;}.step-card:hover{transform:translateY(-4px);box-shadow:0 12px 40px rgba(0,0,0,.07);border-color:var(--coral);}
        .step-num{font-family:var(--serif);font-size:11px;font-weight:600;letter-spacing:.1em;color:var(--gray3);margin-bottom:1rem;text-transform:uppercase;}
        .step-icon-wrap{width:48px;height:48px;border-radius:14px;display:flex;align-items:center;justify-content:center;margin-bottom:1rem;}
        .step-title{font-size:16px;font-weight:700;color:var(--ink);margin-bottom:.5rem;}.step-desc{font-size:13.5px;color:var(--gray4);line-height:1.6;}
        .step-connector{position:absolute;right:-14px;top:50%;transform:translateY(-50%);width:28px;height:28px;background:var(--white);border:1.5px solid var(--gray2);border-radius:50%;display:flex;align-items:center;justify-content:center;z-index:1;}

        .features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.25rem;margin-top:3.5rem;}
        .hiw-step-num{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;background:var(--grad-90);color:white;font-size:14px;font-weight:800;margin-bottom:1rem;}
        .feature-card{background:var(--white);border:1px solid var(--gray2);border-radius:24px;padding:2.25rem 2rem;min-height:240px;transition:transform .25s cubic-bezier(.22,1,.36,1),box-shadow .25s,border-color .25s;position:relative;overflow:hidden;text-align:left;}
        .feature-card::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;background:var(--grad-90);opacity:0;transition:opacity .25s;border-radius:24px 24px 0 0;}
        .feature-card:hover{transform:translateY(-6px);box-shadow:0 16px 48px rgba(255,107,77,.10);border-color:var(--coral);}.feature-card:hover::before{opacity:1;}
        .feature-title{font-size:18px;font-weight:700;color:var(--ink);margin-bottom:.625rem;letter-spacing:-.02em;}.feature-desc{font-size:14px;color:var(--gray4);line-height:1.7;}

        .stats-strip{border-top:1px solid var(--gray2);border-bottom:1px solid var(--gray2);background:var(--white);padding:2.5rem 2rem;}.stats-inner{max-width:800px;margin:0 auto;display:flex;justify-content:center;}.stat-item{flex:1;text-align:center;padding:0 2rem;position:relative;}.stat-item:not(:last-child)::after{content:'';position:absolute;right:0;top:50%;transform:translateY(-50%);height:40px;width:1px;background:var(--gray2);}.stat-number{font-family:var(--serif);font-size:40px;font-weight:600;color:var(--ink);line-height:1;letter-spacing:-.03em;}.stat-suffix{background:var(--grad-90);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}.stat-label{font-size:13px;color:var(--gray3);font-weight:500;margin-top:.375rem;}

        .score-section{background:var(--gray1);padding:6rem 1.5rem;border-top:1px solid var(--gray2);border-bottom:1px solid var(--gray2);}
        @keyframes scoreRingFill{from{stroke-dasharray:0 264;}to{stroke-dasharray:205.92 58.08;}}.score-ring-animated{animation:scoreRingFill 1.8s cubic-bezier(0.22,1,0.36,1) forwards;}

        .testimonials-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.25rem;margin-top:3.5rem;}.testimonial-card{background:var(--white);border:1px solid var(--gray2);border-radius:20px;padding:1.75rem;transition:transform .2s,box-shadow .2s;}.testimonial-card:hover{transform:translateY(-3px);box-shadow:0 8px 32px rgba(0,0,0,.06);}
        .quote-mark{font-family:var(--serif);font-size:48px;line-height:.8;color:var(--beige);margin-bottom:.5rem;font-style:italic;}.quote-text{font-size:14.5px;color:var(--ink);line-height:1.65;margin-bottom:1.25rem;}
        .testimonial-footer{display:flex;align-items:center;gap:.75rem;}.t-avatar{width:40px;height:40px;border-radius:50%;background:var(--cream);border:2px solid var(--beige);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:var(--coral);flex-shrink:0;}.t-name{font-size:13px;font-weight:700;color:var(--ink);}.t-role{font-size:11px;color:var(--gray3);margin-top:2px;}.t-badge{margin-left:auto;background:var(--gray1);color:var(--gray4);border:1px solid var(--gray2);font-size:11px;font-weight:700;padding:3px 10px;border-radius:50px;}

        .demo-section{padding:6rem 1.5rem;background:var(--white);border-top:1px solid var(--gray2);}.demo-grid{display:grid;grid-template-columns:1fr 420px;gap:2.5rem;margin-top:3rem;align-items:start;}
        .demo-info-list{display:flex;flex-direction:column;gap:1rem;margin-top:1.75rem;}.demo-info-item{display:flex;align-items:flex-start;gap:12px;}.demo-info-icon{width:32px;height:32px;border-radius:10px;background:var(--cream);color:var(--coral);display:flex;align-items:center;justify-content:center;flex-shrink:0;}.demo-info-text{font-size:14px;color:var(--gray4);line-height:1.6;padding-top:4px;}.demo-info-text strong{color:var(--ink);}
        .demo-form-card{background:var(--white);border:1px solid var(--gray2);border-radius:24px;padding:2rem;box-shadow:0 8px 32px rgba(0,0,0,.05);}.demo-form-title{font-size:18px;font-weight:700;color:var(--ink);margin-bottom:4px;}.demo-form-sub{font-size:13px;color:var(--gray3);margin-bottom:1.5rem;}
        .demo-form-row{display:flex;flex-direction:column;gap:6px;margin-bottom:1rem;}.demo-form-row-split{display:grid;grid-template-columns:1fr 1fr;gap:1rem;}.demo-label{font-size:12.5px;font-weight:600;color:var(--gray4);}
        .demo-input,.demo-textarea,.demo-select{width:100%;border:1.5px solid var(--gray2);background:var(--gray1);border-radius:12px;padding:11px 14px;font-size:14px;font-family:var(--font);color:var(--ink);transition:border-color .15s,box-shadow .15s;}.demo-input:focus,.demo-textarea:focus,.demo-select:focus{outline:none;border-color:var(--coral);box-shadow:0 0 0 3px rgba(255,107,77,.1);background:var(--white);}.demo-textarea{resize:vertical;min-height:80px;}
        .demo-submit-btn{width:100%;background:linear-gradient(135deg,#FF6B4D,#FFB347);color:white;border:none;padding:13px 24px;border-radius:50px;font-size:14.5px;font-weight:700;cursor:pointer;font-family:var(--font);margin-top:.5rem;transition:transform .15s,box-shadow .15s;box-shadow:0 4px 20px rgba(255,107,77,.25);display:flex;align-items:center;justify-content:center;gap:8px;}.demo-submit-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 30px rgba(255,107,77,.35);}.demo-submit-btn:disabled{opacity:.6;cursor:not-allowed;}
        .demo-status-msg{display:flex;align-items:center;gap:8px;font-size:13.5px;font-weight:600;padding:12px 16px;border-radius:12px;margin-top:1rem;}.demo-status-success{background:#EAFAF0;color:#16A34A;}.demo-status-error{background:#FFF0F2;color:#E5542F;}
        .demo-form-footer{display:flex;align-items:center;gap:8px;margin-top:1.25rem;padding-top:1.25rem;border-top:1px solid var(--gray2);font-size:12px;color:var(--gray3);}

        .single-cta-section{padding:6rem 1.5rem;background:var(--white);border-top:1px solid var(--gray2);}.single-cta-card{max-width:1000px;margin:0 auto;border-radius:24px;padding:3rem;position:relative;overflow:hidden;background:linear-gradient(135deg,#FF6B4D,#FFB347);color:white;text-align:center;}.single-cta-title{font-family:var(--serif);font-size:clamp(24px,3vw,32px);font-weight:600;line-height:1.2;margin-bottom:.75rem;}.single-cta-sub{font-size:14.5px;opacity:.85;line-height:1.6;margin-bottom:2rem;max-width:440px;margin-left:auto;margin-right:auto;}.btn-cta-white{background:white;color:var(--coral);border:none;padding:12px 28px;border-radius:50px;font-size:14px;font-weight:700;cursor:pointer;font-family:var(--font);transition:transform .15s,box-shadow .15s;text-decoration:none;display:inline-flex;align-items:center;gap:7px;}.btn-cta-white:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,.15);}.cta-bg-shape{position:absolute;border-radius:50%;opacity:.1;pointer-events:none;background:white;}

        .footer{background:var(--ink);color:white;padding:3.5rem 2.5rem 2rem;}.footer-inner{max-width:1100px;margin:0 auto;}.footer-top{display:flex;justify-content:space-between;gap:3rem;padding-bottom:2.5rem;border-bottom:1px solid rgba(255,255,255,.08);flex-wrap:wrap;}.footer-brand{max-width:260px;}.footer-brand-desc{font-size:13px;color:rgba(255,255,255,.45);line-height:1.65;}.footer-col-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:rgba(255,255,255,.35);margin-bottom:1rem;}.footer-links{display:flex;flex-direction:column;gap:.625rem;}.footer-link{font-size:13.5px;color:rgba(255,255,255,.6);text-decoration:none;transition:color .15s;width:fit-content;}.footer-link:hover{color:white;}.footer-bottom{display:flex;justify-content:space-between;align-items:center;padding-top:2rem;font-size:12px;color:rgba(255,255,255,.3);flex-wrap:wrap;gap:.75rem;}.footer-bottom-links{display:flex;gap:1.5rem;}.footer-bottom-link{color:rgba(255,255,255,.3);text-decoration:none;font-size:12px;}.footer-bottom-link:hover{color:rgba(255,255,255,.7);}

        @media(max-width:900px){.nav-links{display:none;}.hero-inner{flex-direction:column;text-align:center;}.hero-content{text-align:center;}.hero-image-wrap{flex:none;width:360px;}.hero-ctas{justify-content:center;}.hero-badge-row{justify-content:center;}.hero-social-proof{justify-content:center;}.steps-grid{grid-template-columns:repeat(2,1fr);}.features-grid{grid-template-columns:1fr 1fr;}.testimonials-grid{grid-template-columns:1fr;}.step-connector{display:none;}.demo-grid{grid-template-columns:1fr;}.demo-form-row-split{grid-template-columns:1fr;}}
        @media(max-width:600px){.navbar{padding:0 1.25rem;}.hero{padding:6rem 1.25rem 3rem;}.steps-grid{grid-template-columns:1fr;}.features-grid{grid-template-columns:1fr;}.stats-inner{flex-direction:column;gap:2rem;}.stat-item::after{display:none;}.single-cta-card{padding:2rem 1.5rem;}}
      `}</style>

      <nav className={`navbar${scrolled?" scrolled":""}`}>
        <Link href='/recruiters' style={{display:"flex",alignItems:"center",textDecoration:"none"}}><Image src="/Antyl.png" alt="Antyl" width={50} height={50}/></Link>
        <div className="nav-links"><a href="#how-it-works" className="nav-link">How it works</a><a href="#features" className="nav-link">Features</a><a href="#antyl-score" className="nav-link">Antyl Score</a><Link href="/" className="nav-link">For developers</Link></div>
        <div className="nav-actions"><a href="/login" className="btn-ghost-nav">Log in</a><a href="#request-demo" className="btn-ghost-nav">Request demo</a><a href="/signup?role=recruiter" className="btn-primary-nav">Post a job</a></div>
      </nav>

      {/* HERO - Split layout */}
      <section className={`hero lazy-section${lazyHero.visible?" visible":""}`} ref={lazyHero.ref}>
        <div className="hero-bg-blob blob-1"/><div className="hero-bg-blob blob-2"/><div className="hero-bg-blob blob-3"/>
        <div className="hero-inner">
          <div className="hero-content">
            <div className="hero-eyebrow"><span className="eyebrow-dot"/>AI-verified candidates · Score-based filtering</div>
            <h1 className="hero-title blur-reveal">Hire people who can actually <em>do the job.</em></h1>
            <p className="hero-sub blur-reveal">Antyl verifies every developer with AI before they reach your inbox. <strong>Filter by Antyl Score</strong> and skip the resume guesswork entirely.</p>
            <div className="hero-ctas">
              <a href="/signup?role=recruiter" className="btn-hero-primary">Post a job free</a>
              <a href="#how-it-works" className="btn-hero-secondary">See how it works</a>
            </div>
            <p className="hero-dev-link">Looking for a job instead? <Link href="/developers">Go to the developer side →</Link></p>
            <div className="hero-social-proof">
              <div className="proof-avatars">
                {[{initials:"NS",bg:"#F3EFFE",color:"#8B5CF6"},{initials:"KR",bg:"#FFF0F2",color:"#FF7A8A"},{initials:"AM",bg:"#E6F4FF",color:"#3B82F6"},{initials:"SK",bg:"#EAFAF0",color:"#22C55E"}].map(a=>(
                  <div key={a.initials} className="proof-avatar" style={{background:a.bg,color:a.color}}>{a.initials}</div>
                ))}
              </div>
              Trusted by 340+ companies hiring on Antyl
            </div>
            <div className="hero-badge-row" style={{marginTop:".75rem"}}>
              <span className="hero-badge"><span className="hero-badge-dot" style={{background:"#22C55E"}}/>Every candidate GitHub-verified</span>
              <span className="hero-badge"><span className="hero-badge-dot" style={{background:"#FF6B4D"}}/>Filter by Antyl Score</span>
              <span className="hero-badge"><span className="hero-badge-dot" style={{background:"#FFB347"}}/>Free to post</span>
            </div>
          </div>
          <div className="hero-image-wrap">
            {/* <div className="hero-image-blob"/> */}
            <Image src="/recruiters_pic.png" alt="Recruiter using Antyl" width={2060} height={2040} style={{objectFit:"cover",background:"transparent"}} priority/>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className={`stats-strip lazy-section${lazyStats.visible?" visible":""}`} ref={(el)=>{(lazyStats.ref as React.MutableRefObject<HTMLDivElement|null>).current=el;statsRef.current=el;}}>
        <div className="stats-inner">
          <div className="stat-item stagger-child"><div className="stat-number">{counts.devs>=1000?`${(counts.devs/1000).toFixed(counts.devs>=10000?0:1)}k`:counts.devs}<span className="stat-suffix">+</span></div><div className="stat-label">Verified developers</div></div>
          <div className="stat-item stagger-child"><div className="stat-number">{counts.companies}<span className="stat-suffix">+</span></div><div className="stat-label">Companies hiring</div></div>
          <div className="stat-item stagger-child"><div className="stat-number">{counts.match}<span className="stat-suffix">%</span></div><div className="stat-label">Match accuracy</div></div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section className={`section lazy-section${lazyHowItWorks.visible?" visible":""}`} id="how-it-works" style={{borderTop:"1px solid var(--gray2)"}} ref={lazyHowItWorks.ref}>
        <div className="section-inner">
          <span className="section-eyebrow"><span style={{width:6,height:6,borderRadius:"50%",background:"var(--coral)",display:"inline-block"}}/>How it works</span>
          <h2 className="section-title blur-reveal">From job post to <em>qualified pipeline</em> in 4 steps</h2>
          <p className="section-sub">No sifting through hundreds of unverified resumes. Post a role, get matched, filter by score, and manage from one pipeline.</p>
          <div className="steps-grid">
            {steps.map((step,i)=>(
              <div className="step-card stagger-child" key={step.num}>
                <div className="step-num">{step.num}</div>
                <div className="step-icon-wrap" style={{background:step.bg,color:step.color}}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {i===0&&<><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></>}
                    {i===1&&<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></>}
                    {i===2&&<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>}
                    {i===3&&<><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></>}
                  </svg>
                </div>
                <div className="step-title">{step.title}</div>
                <p className="step-desc">{step.desc}</p>
                {i<steps.length-1&&<div className="step-connector"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--gray3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES - 6 card enhanced */}
      <section className={`section lazy-section${lazyFeatures.visible?" visible":""}`} id="features" ref={lazyFeatures.ref}>
        <div className="section-inner" style={{textAlign:"center"}}>
          <span className="section-eyebrow" style={{justifyContent:"center"}}><span style={{width:6,height:6,borderRadius:"50%",background:"var(--coral)",display:"inline-block"}}/>Everything included</span>
          <h2 className="section-title blur-reveal">Built for hiring teams that <em>need signal, not noise</em></h2>
          <p className="section-sub" style={{margin:"0 auto 3.5rem"}}>Every feature cuts screening time — so you spend less time filtering resumes and more time talking to people worth hiring.</p>
          <div className="features-grid">
            {/* Card 1: Profile JD Match */}
            <div className="feature-card stagger-child">
              <span className="hiw-step-num">1</span>
              <div className="feature-title">Profile-JD match</div>
              <p className="feature-desc">Describe the role once. Antyl auto-matches portfolio-verified candidates whose skills fit.</p>
              <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:"1rem"}}>
                {[{role:"React Frontend",score:"92",color:"#22C55E"},{role:"Node.js Backend",score:"87",color:"var(--coral)"},{role:"Full Stack Python",score:"81",color:"var(--amber)"}].map(m=>(
                  <div key={m.role} style={{display:"flex",alignItems:"center",gap:10,background:"var(--gray1)",borderRadius:12,padding:"10px 14px"}}><span style={{fontSize:12,fontWeight:500,color:"var(--ink)",flex:1}}>{m.role}</span><span style={{fontSize:10,fontWeight:700,color:m.color}}>{m.score}% match</span></div>
                ))}
              </div>
            </div>
            {/* Card 2: Kanban Pipeline (was card 3) */}
            <div className="feature-card stagger-child">
              <span className="hiw-step-num">2</span>
              <div className="feature-title">Kanban pipeline</div>
              <p className="feature-desc">Move candidates through stages — applied, screening, interview, offer — in one view.</p>
              <div style={{display:"flex",gap:6,marginTop:"1rem"}}>
                {[{title:"Applied",items:["Cand. A","Cand. B"],bg:"var(--gray1)",color:"var(--gray3)"},{title:"Interview",items:["Cand. C"],bg:"#FFF6EE",color:"var(--coral)"},{title:"Offer",items:["Cand. D"],bg:"#EAFAF0",color:"#22C55E"}].map(col=>(
                  <div key={col.title} style={{flex:1,minWidth:0,background:col.bg,borderRadius:12,padding:"10px 6px"}}>
                    <div style={{fontSize:9,fontWeight:700,color:col.color,textTransform:"uppercase",letterSpacing:".05em",marginBottom:8,textAlign:"center"}}>{col.title}</div>
                    {col.items.map(item=>(<div key={item} style={{background:"var(--white)",border:"1px solid var(--gray2)",borderRadius:8,padding:"5px 6px",fontSize:9,fontWeight:500,color:"var(--ink)",marginBottom:5,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item}</div>))}
                  </div>
                ))}
              </div>
            </div>
            {/* Card 3: Filter by Antyl Score (was card 2) */}
            <div className="feature-card stagger-child">
              <span className="hiw-step-num">3</span>
              <div className="feature-title">Filter by Antyl Score</div>
              <p className="feature-desc">Set a minimum score and only qualified candidates appear in your feed.</p>
              <div style={{display:"flex",gap:"1.25rem",alignItems:"center",marginTop:"1rem"}}>
                <div style={{position:"relative",width:80,height:80,flexShrink:0}}>
                  <svg width="80" height="80" viewBox="0 0 100 100" style={{transform:"rotate(-90deg)"}}><circle cx="50" cy="50" r="42" fill="none" stroke="#f3f4f6" strokeWidth="8"/><circle cx="50" cy="50" r="42" fill="none" stroke="url(#sgR)" strokeWidth="8" strokeDasharray="185 79" strokeLinecap="round"/><defs><linearGradient id="sgR" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#FF6B4D"/><stop offset="100%" stopColor="#FFB347"/></linearGradient></defs></svg>
                  <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:22,fontWeight:700,color:"var(--ink)",fontFamily:"var(--serif)"}}>70+</span></div>
                </div>
                <div style={{fontSize:13,color:"var(--gray4)",lineHeight:1.6}}>Only candidates scoring <strong style={{color:"var(--coral)"}}>70 and above</strong> make it to your pipeline.</div>
              </div>
            </div>
            {/* Card 4: Portfolio-verified */}
            <div className="feature-card stagger-child">
              <span className="hiw-step-num">4</span>
              <div className="feature-title">Portfolio-verified candidates</div>
              <p className="feature-desc">Every candidate is questioned by AI about their resume before they reach your feed.</p>
              <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:"1rem"}}>
                {[{q:"Explain your project architecture decisions",status:"Verified",color:"#22C55E"},{q:"Why did you choose this tech stack?",status:"Verified",color:"#22C55E"},{q:"Walk through your key achievements",status:"Verified",color:"#22C55E"}].map(v=>(
                  <div key={v.q} style={{display:"flex",alignItems:"center",gap:8,background:"var(--gray1)",borderRadius:12,padding:"10px 14px"}}><span style={{fontSize:11,color:"var(--ink)",fontWeight:500,flex:1}}>{v.q}</span><span style={{fontSize:10,fontWeight:700,color:v.color}}>✓ {v.status}</span></div>
                ))}
              </div>
            </div>
            {/* Card 5: Trust score filtering */}
            <div className="feature-card stagger-child">
              <span className="hiw-step-num">5</span>
              <div className="feature-title">Trust score filtering</div>
              <p className="feature-desc">Set a minimum score range with a slider and instantly narrow your candidate pool to who&apos;s qualified.</p>
              <div style={{display:"flex",flexDirection:"column",gap:12,marginTop:"1rem"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{fontSize:12,fontWeight:600,color:"var(--ink)"}}>Min score</span>
                  <span style={{fontSize:18,fontWeight:700,color:"var(--coral)",fontFamily:"var(--serif)"}}>65</span>
                </div>
                <div style={{position:"relative",height:6,background:"var(--gray2)",borderRadius:3}}>
                  <div style={{position:"absolute",left:0,top:0,height:"100%",width:"65%",background:"linear-gradient(90deg,#FF6B4D,#FFB347)",borderRadius:3}}/>
                  <div style={{position:"absolute",top:"50%",left:"65%",transform:"translate(-50%,-50%)",width:16,height:16,borderRadius:"50%",background:"var(--coral)",border:"3px solid white",boxShadow:"0 2px 6px rgba(255,107,77,.3)"}}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"var(--gray3)"}}><span>0</span><span>50</span><span>100</span></div>
                <div style={{background:"var(--cream)",border:"1px solid var(--beige)",borderRadius:10,padding:"10px 12px",fontSize:12,color:"var(--gray4)"}}>
                  <strong style={{color:"var(--ink)"}}>238 candidates</strong> match your criteria
                </div>
              </div>
            </div>
            {/* Card 6: Live application feed */}
            <div className="feature-card stagger-child">
              <span className="hiw-step-num">6</span>
              <div className="feature-title">Live application feed</div>
              <p className="feature-desc">See candidates land in your pipeline the moment auto-apply matches them to your open role.</p>
              <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:"1rem"}}>
                {[{name:"Priya S.",role:"Frontend Engineer",score:88,time:"Just now",color:"#22C55E"},{name:"Rahul M.",role:"Backend Dev",score:91,time:"2m ago",color:"var(--coral)"},{name:"Dev P.",role:"Full Stack",score:79,time:"8m ago",color:"var(--amber)"}].map(c=>(
                  <div key={c.name} style={{display:"flex",alignItems:"center",gap:10,background:"var(--gray1)",borderRadius:12,padding:"10px 14px"}}>
                    <div style={{width:28,height:28,borderRadius:"50%",background:"var(--cream)",border:"1px solid var(--beige)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"var(--coral)"}}>{c.name.split(" ").map(n=>n[0]).join("")}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:600,color:"var(--ink)"}}>{c.name}</div>
                      <div style={{fontSize:10,color:"var(--gray3)"}}>{c.role} · Score: {c.score}</div>
                    </div>
                    <span style={{fontSize:10,fontWeight:600,color:c.color}}>{c.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginTop:"3rem",fontSize:13,color:"var(--gray3)"}}><div style={{width:24,height:24,borderRadius:"50%",background:"var(--cream)",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="12" height="12" fill="var(--coral)" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg></div><span>Candidate data is secure. We never share without consent.</span></div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className={`section lazy-section${lazyTestimonials.visible?" visible":""}`} style={{background:"var(--gray1)",borderTop:"1px solid var(--gray2)"}} ref={lazyTestimonials.ref}>
        <div className="section-inner"><div style={{textAlign:"center",maxWidth:520,margin:"0 auto"}}><span className="section-eyebrow"><span style={{width:6,height:6,borderRadius:"50%",background:"var(--coral)",display:"inline-block"}}/>What recruiters say</span><h2 className="section-title blur-reveal">Real signal for <em>real hiring teams</em></h2></div>
          <div className="testimonials-grid">{testimonials.map(t=>(<div className="testimonial-card stagger-child" key={t.name}><div className="quote-mark">&ldquo;</div><p className="quote-text">{t.quote}</p><div className="testimonial-footer"><div className="t-avatar">{t.initials}</div><div><div className="t-name">{t.name}</div><div className="t-role">{t.role}</div></div><div className="t-badge">Recruiter</div></div></div>))}</div>
        </div>
      </section>

      {/* DEMO REQUEST */}
      <section className={`demo-section lazy-section${lazyDemo.visible?" visible":""}`} id="request-demo" ref={lazyDemo.ref}>
        <div className="section-inner"><div className="demo-grid">
          <div><span className="section-eyebrow"><span style={{width:6,height:6,borderRadius:"50%",background:"var(--coral)",display:"inline-block"}}/>Request a demo</span><h2 className="section-title blur-reveal">See Antyl <em>working for your team</em></h2><p className="section-sub">We&apos;ll walk you through score filtering, the pipeline, and how matching works for your stack.</p>
            <div className="demo-info-list"><div className="demo-info-item"><span className="demo-info-icon"><svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></span><span className="demo-info-text"><strong>15-20 min.</strong> Live walkthrough, no slide deck.</span></div><div className="demo-info-item"><span className="demo-info-icon"><svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></span><span className="demo-info-text"><strong>Set your score bar.</strong> We show how filtering works for your roles.</span></div><div className="demo-info-item"><span className="demo-info-icon"><svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></span><span className="demo-info-text"><strong>Reply within a day.</strong> Someone follows up to find a time.</span></div></div>
          </div>
          <div className="demo-form-card"><div className="demo-form-title">Request a demo</div><div className="demo-form-sub">Tell us about your team.</div>
            <form onSubmit={handleDemoSubmit}>
              <div className="demo-form-row-split"><div className="demo-form-row"><label className="demo-label">Full name</label><input name="name" className="demo-input" value={demoForm.name} onChange={handleDemoChange} required placeholder="Your name"/></div><div className="demo-form-row"><label className="demo-label">Company</label><input name="company" className="demo-input" value={demoForm.company} onChange={handleDemoChange} required placeholder="Company name"/></div></div>
              <div className="demo-form-row"><label className="demo-label">Work email</label><input name="work_email" className="demo-input" type="email" value={demoForm.work_email} onChange={handleDemoChange} required placeholder="you@company.com"/></div>
              <div className="demo-form-row-split"><div className="demo-form-row"><label className="demo-label">Phone (optional)</label><input name="phone" className="demo-input" type="tel" value={demoForm.phone} onChange={handleDemoChange} placeholder="+91 ..."/></div><div className="demo-form-row"><label className="demo-label">Team size</label><select name="team_size" className="demo-select" value={demoForm.team_size} onChange={handleDemoChange}><option value="">Select</option><option value="1-10">1–10</option><option value="11-50">11–50</option><option value="51-200">51–200</option><option value="200+">200+</option></select></div></div>
              <div className="demo-form-row"><label className="demo-label">Hiring for? (optional)</label><textarea name="message" className="demo-textarea" value={demoForm.message} onChange={handleDemoChange} placeholder="e.g. Senior backend engineers, Node.js/Python"/></div>
              <button type="submit" className="demo-submit-btn" disabled={demoStatus==="loading"}>{demoStatus==="loading"?"Sending...":"Request demo"}</button>
              {demoStatus==="success"&&<div className="demo-status-msg demo-status-success">Thanks! We&apos;ll be in touch within a day.</div>}
              {demoStatus==="error"&&<div className="demo-status-msg demo-status-error">Something went wrong. Try again or email info@antyl.org.</div>}
            </form>
            <div className="demo-form-footer"><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>We&apos;ll never share your info. No spam.</div>
          </div>
        </div></div>
      </section>

      {/* CTA */}
      <section className={`single-cta-section lazy-section${lazyDualCta.visible?" visible":""}`} ref={lazyDualCta.ref}>
        <div className="single-cta-card"><div className="cta-bg-shape" style={{width:300,height:300,top:-100,right:-100}}/><div className="cta-bg-shape" style={{width:220,height:220,bottom:-80,left:-80}}/><div style={{position:"relative",zIndex:1}}><span style={{background:"rgba(255,255,255,.2)",color:"white",fontSize:11,fontWeight:700,padding:"5px 14px",borderRadius:50,display:"inline-block",marginBottom:"1.25rem",letterSpacing:".06em",textTransform:"uppercase" as const}}>Job-hunting, not hiring?</span><h3 className="single-cta-title">Antyl also works the other way around.</h3><p className="single-cta-sub">If you&apos;re a developer looking for your next role, get verified and let auto-apply do the work.</p><Link href="/developers" className="btn-cta-white">Go to developer page</Link></div></div>
      </section>

      {/* FOOTER */}
      <footer className="footer"><div className="footer-inner"><div className="footer-top"><div className="footer-brand"><Image src="/Antyl.png" alt="Antyl" width={60} height={60} style={{marginBottom:"1rem"}}/><p className="footer-brand-desc">AI-powered developer verification and smart job matching. Built for hiring teams who want proof, not promises.</p></div><div><div className="footer-col-title">Product</div><div className="footer-links"><a href="#features" className="footer-link">Features</a><a href="#antyl-score" className="footer-link">Antyl Score</a></div></div><div><div className="footer-col-title">Recruiters</div><div className="footer-links"><a href="/signup?role=recruiter" className="footer-link">Post a job</a><a href="#request-demo" className="footer-link">Request demo</a></div></div><div><div className="footer-col-title">Developers</div><div className="footer-links"><Link href="/developers" className="footer-link">Get verified</Link><Link href="/developers" className="footer-link">Job feed</Link></div></div><div id="contact"><div className="footer-col-title">Contact</div><div className="footer-links"><a href="mailto:info@antyl.org" className="footer-link">info@antyl.org</a><a href="tel:+918172836138" className="footer-link">+91-8172836138</a></div></div></div><div className="footer-bottom"><span>© 2026 Antyl. All rights reserved.</span><div className="footer-bottom-links"><a href="/privacy" className="footer-bottom-link">Privacy</a><a href="/terms" className="footer-bottom-link">Terms</a></div></div></div></footer>
    </>
  );
}
