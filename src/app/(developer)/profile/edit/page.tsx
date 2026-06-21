"use client";

import { useEffect, useState } from "react";

import {
  getVerificationScore,
  getVerificationCooldown,
} from "@/services/verification.service";

interface ScoreData {
  overall_score: number;
  tier: string;
  dimensions: {
    technical_depth: number;
    code_quality: number;
    project_complexity: number;
    communication: number;
  };
  improvement_suggestions: string[];
}

export default function VerificationResultPage() {
  const [loading, setLoading] =
    useState(true);

  const [score, setScore] =
    useState<ScoreData | null>(null);

  const [cooldown, setCooldown] =
    useState({
      days: 0,
      hours: 0,
    });

  useEffect(() => {
    async function loadData() {
      try {
        const scoreData =
          await getVerificationScore();

        const cooldownData =
          await getVerificationCooldown();

        setScore(scoreData);
        setCooldown(cooldownData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        Loading results...
      </div>
    );
  }

  if (!score) {
    return (
      <div className="p-8">
        No verification score found.
      </div>
    );
  }

  const dimensions = [
    {
      label: "Technical Depth",
      value:
        score.dimensions
          .technical_depth,
    },
    {
      label: "Code Quality",
      value:
        score.dimensions
          .code_quality,
    },
    {
      label: "Project Complexity",
      value:
        score.dimensions
          .project_complexity,
    },
    {
      label: "Communication",
      value:
        score.dimensions
          .communication,
    },
  ];

  return (
    <>
      <style>{`
        .page {
          min-height:100vh;
          background:#FAF8F5;
          padding:32px;
        }

        .container {
          max-width:900px;
          margin:0 auto;
        }

        .card {
          background:white;
          border:1.5px solid #E8E4DF;
          border-radius:24px;
          padding:32px;
          margin-bottom:24px;
        }

        .score {
          font-size:72px;
          font-weight:800;
          text-align:center;
          color:#FF6B4D;
        }

        .tier {
          text-align:center;
          font-size:18px;
          font-weight:700;
          margin-top:8px;
        }

        .section-title {
          font-size:22px;
          font-weight:700;
          margin-bottom:18px;
        }

        .bar-row {
          margin-bottom:18px;
        }

        .bar-header {
          display:flex;
          justify-content:space-between;
          margin-bottom:6px;
        }

        .bar-bg {
          height:12px;
          background:#E8E4DF;
          border-radius:999px;
          overflow:hidden;
        }

        .bar-fill {
          height:100%;
          background:linear-gradient(
            90deg,
            #FF6B4D,
            #FFB347
          );
        }

        .suggestion {
          padding:12px 0;
          border-bottom:1px solid #EEE;
        }

        .cooldown {
          color:#B0A89E;
          font-weight:600;
        }
      `}</style>

      <div className="page">
        <div className="container">

          <div className="card">
            <div className="score">
              {score.overall_score}
            </div>

            <div className="tier">
              {score.tier}
            </div>
          </div>

          <div className="card">
            <div className="section-title">
              Score Breakdown
            </div>

            {dimensions.map(
              (item) => (
                <div
                  key={item.label}
                  className="bar-row"
                >
                  <div className="bar-header">
                    <span>
                      {item.label}
                    </span>

                    <span>
                      {item.value}%
                    </span>
                  </div>

                  <div className="bar-bg">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${item.value}%`,
                      }}
                    />
                  </div>
                </div>
              )
            )}
          </div>

          <div className="card">
            <div className="section-title">
              Improvement Suggestions
            </div>

            {score.improvement_suggestions?.map(
              (
                suggestion,
                index
              ) => (
                <div
                  key={index}
                  className="suggestion"
                >
                  • {suggestion}
                </div>
              )
            )}
          </div>

          <div className="card">
            <div className="section-title">
              Next Verification
            </div>

            <div className="cooldown">
              {cooldown.days} days{" "}
              {cooldown.hours} hours
              remaining
            </div>
          </div>

        </div>
      </div>
    </>
  );
}