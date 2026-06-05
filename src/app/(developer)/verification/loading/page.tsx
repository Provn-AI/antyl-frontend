"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function VerificationLoadingPage() {
  const router = useRouter();

  const [progress, setProgress] =
    useState(0);

  const messages = [
    "Analysing your repositories...",
    "Understanding architecture decisions...",
    "Generating verification questions...",
    "Preparing your session...",
  ];

  const [messageIndex, setMessageIndex] =
    useState(0);

  useEffect(() => {
    const sessionId =
      localStorage.getItem(
        "verification_session_id"
      );

    if (!sessionId) {
      router.replace(
        "/verification"
      );
      return;
    }

    const progressInterval =
      setInterval(() => {
        setProgress((prev) =>
          prev >= 100
            ? 100
            : prev + 1
        );
      }, 250);

    const messageInterval =
      setInterval(() => {
        setMessageIndex(
          (prev) =>
            prev <
            messages.length - 1
              ? prev + 1
              : prev
        );
      }, 3000);

    const redirectTimer =
      setTimeout(() => {
        router.push(
          `/verification/session/${sessionId}`
        );
      }, 12000);

    return () => {
      clearInterval(
        progressInterval
      );
      clearInterval(
        messageInterval
      );
      clearTimeout(
        redirectTimer
      );
    };
  }, [router]);

  return (
    <>
      <style>{`
        .page{
          min-height:100vh;
          background:#FAF8F5;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:24px;
        }

        .card{
          width:100%;
          max-width:700px;
          background:white;
          border:1.5px solid #E8E4DF;
          border-radius:24px;
          padding:32px;
          text-align:center;
        }

        .title{
          font-size:30px;
          font-weight:700;
          margin-bottom:10px;
          font-family:'DM Sans',sans-serif;
        }

        .message{
          color:#B0A89E;
          margin-bottom:32px;
          font-family:'DM Sans',sans-serif;
        }

        .progress-bg{
          width:100%;
          height:14px;
          border-radius:999px;
          background:#EFEAE4;
          overflow:hidden;
        }

        .progress-fill{
          height:100%;
          border-radius:999px;
          background:linear-gradient(
            90deg,
            #FF6B4D,
            #FFB347
          );
          transition:width .3s ease;
        }

        .percentage{
          margin-top:14px;
          font-weight:700;
          color:#FF6B4D;
          font-family:'DM Sans',sans-serif;
        }
      `}</style>

      <div className="page">
        <div className="card">
          <div className="title">
            Preparing Verification
          </div>

          <div className="message">
            {messages[
              messageIndex
            ]}
          </div>

          <div className="progress-bg">
            <div
              className="progress-fill"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <div className="percentage">
            {progress}%
          </div>
        </div>
      </div>
    </>
  );
}