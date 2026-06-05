"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

export default function VerificationIntroPage() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const startVerification =
    async () => {
      try {
        setLoading(true);

        const token =
          localStorage.getItem(
            "access_token"
          );

        const res = await fetch(
          `${API_URL}/developer/verification/start`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data =
          await res.json();

        if (!res.ok) {
          throw new Error(
            data.detail ||
              "Failed to start verification"
          );
        }

        localStorage.setItem(
          "verification_session_id",
          data.session_id
        );

        router.push(
          "/verification/loading"
        );
      } catch (error) {
        console.error(error);
        alert(
          "Failed to start verification."
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <>
      <style>{`
        .page {
          min-height:100vh;
          background:#FAF8F5;
          display:flex;
          justify-content:center;
          align-items:center;
          padding:24px;
        }

        .card {
          width:100%;
          max-width:700px;
          background:white;
          border:1.5px solid #E8E4DF;
          border-radius:24px;
          padding:32px;
        }

        .title {
          font-size:32px;
          font-weight:700;
          margin-bottom:12px;
          font-family:'DM Sans',sans-serif;
        }

        .subtitle {
          color:#B0A89E;
          margin-bottom:24px;
          font-family:'DM Sans',sans-serif;
        }

        .info-box {
          border:1px solid #FFE1D8;
          background:#FFF5F2;
          border-radius:18px;
          padding:20px;
          margin-bottom:24px;
        }

        .estimate {
          font-size:18px;
          font-weight:700;
          color:#FF6B4D;
          margin-bottom:10px;
        }

        .list {
          display:flex;
          flex-direction:column;
          gap:10px;
        }

        .item {
          color:#444;
          font-size:14px;
        }

        .btn {
          width:100%;
          border:none;
          border-radius:50px;
          padding:16px;
          cursor:pointer;
          color:white;
          font-weight:700;
          background:linear-gradient(
            90deg,
            #FF6B4D,
            #FFB347
          );
        }

        .btn:disabled {
          opacity:.5;
        }
      `}</style>

      <div className="page">
        <div className="card">
          <div className="title">
            Verification Process
          </div>

          <div className="subtitle">
            Verify your engineering
            skills using your own
            repositories.
          </div>

          <div className="info-box">
            <div className="estimate">
              Estimated Time:
              30 Minutes
            </div>

            <div className="list">
              <div className="item">
                ✓ Questions based on
                your repositories
              </div>

              <div className="item">
                ✓ Architecture
                decisions
              </div>

              <div className="item">
                ✓ Implementation
                details
              </div>

              <div className="item">
                ✓ Debugging and edge
                cases
              </div>

              <div className="item">
                ✓ Cannot be paused
                after starting
              </div>
            </div>
          </div>

          <button
            className="btn"
            onClick={
              startVerification
            }
            disabled={loading}
          >
            {loading
              ? "Generating Questions..."
              : "Start Verification"}
          </button>
        </div>
      </div>
    </>
  );
}