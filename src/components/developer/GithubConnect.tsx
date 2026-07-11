"use client";

import { useState } from "react";

interface GithubConnectProps {
  connected?: boolean;
  username?: string | null;
  onConnected?: (username: string) => void;
  onDisconnected?: () => void;
  onSkip?: () => void;
  skipping?: boolean;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

export default function GithubConnect({
  connected = false,
  username = null,
  onConnected,
  onDisconnected,
  onSkip,
  skipping = false,
}: GithubConnectProps) {
  const [isConnected, setIsConnected] =
    useState(connected);

  const [githubUser, setGithubUser] =
    useState(username);

  const [loading, setLoading] =
    useState(false);

  const connectGithub = async () => {
  const clientId =
    process.env
      .NEXT_PUBLIC_GITHUB_CLIENT_ID;

  const redirectUri =
    window.location.origin +
    "/onboarding/github/callback";

  const githubUrl =
    `https://github.com/login/oauth/authorize` +
    `?client_id=${clientId}` +
    `&scope=repo` +
    `&redirect_uri=${encodeURIComponent(
      redirectUri
    )}`;

  window.location.href = githubUrl;
};

  const disconnectGithub = async () => {
    try {
      setLoading(true);

      const token =
        localStorage.getItem("access_token");

      const res = await fetch(
        `${API_URL}/developer/github/disconnect`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error();
      }

      setIsConnected(false);
      setGithubUser(null);

      onDisconnected?.();
    } catch {
      alert("Failed to disconnect GitHub");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .github-card {
          width:100%;
          background:#fff;
          border:1.5px solid #E8E4DF;
          border-radius:18px;
          padding:20px;
        }

        .github-header {
          display:flex;
          gap:14px;
          align-items:center;
        }

        .github-icon {
          width:48px;
          height:48px;
          border-radius:14px;
          background:#F5F3F0;
          display:flex;
          align-items:center;
          justify-content:center;
        }

        .github-title {
          font-size:15px;
          font-weight:700;
          color:#1A1A1A;
          font-family:'DM Sans',sans-serif;
        }

        .github-subtitle {
          font-size:12px;
          color:#B0A89E;
          margin-top:2px;
        }

        .status {
          margin-top:18px;
          padding:14px;
          border-radius:12px;
          background:#FFF5F2;
          border:1px solid #FFE1D8;
        }

        .status-user {
          color:#FF6B4D;
          font-weight:700;
          font-size:14px;
        }

        .btn {
          width:100%;
          margin-top:18px;
          border:none;
          border-radius:50px;
          padding:14px;
          cursor:pointer;
          font-weight:700;
          color:white;
          background:linear-gradient(
            90deg,
            #FF6B4D,
            #FFB347
          );
          font-family:'DM Sans',sans-serif;
        }

        .disconnect-btn {
          background:#FF3B30;
        }

        .btn:disabled {
          opacity:.5;
          cursor:not-allowed;
        }

        .skip-divider {
          display:flex;
          align-items:center;
          gap:10px;
          margin-top:20px;
        }

        .skip-divider::before,
        .skip-divider::after {
          content:'';
          flex:1;
          height:1px;
          background:#EEEAE4;
        }

        .skip-divider span {
          font-size:11px;
          font-weight:600;
          color:#C7BFB5;
          font-family:'DM Sans',sans-serif;
          letter-spacing:0.02em;
          white-space:nowrap;
        }

        .skip-btn {
          width:100%;
          margin-top:12px;
          border:1.5px solid #EEEAE4;
          background:#FDFBF9;
          border-radius:50px;
          padding:12px 16px;
          cursor:pointer;
          display:flex;
          align-items:center;
          justify-content:center;
          gap:7px;
          font-weight:600;
          font-size:13px;
          color:#9C9border-box;
          color:#8A8177;
          font-family:'DM Sans',sans-serif;
          transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
        }

        .skip-btn:hover:not(:disabled) {
          background:#FFF5F2;
          border-color:#FFD3C4;
          color:#FF6B4D;
        }

        .skip-btn:disabled {
          opacity:.5;
          cursor:not-allowed;
        }

        .skip-btn svg {
          flex-shrink:0;
        }
      `}</style>

      <div className="github-card">
        <div className="github-header">
          <div className="github-icon">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 .5C5.65.5.5 5.66.5 12.02c0 5.09 3.29 9.41 7.86 10.94.57.1.78-.25.78-.55v-2.14c-3.2.7-3.88-1.54-3.88-1.54-.52-1.34-1.28-1.69-1.28-1.69-1.04-.72.08-.71.08-.71 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.67 1.24 3.32.95.1-.74.4-1.24.72-1.53-2.56-.29-5.25-1.29-5.25-5.72 0-1.26.45-2.28 1.18-3.08-.12-.29-.51-1.45.11-3.03 0 0 .96-.31 3.14 1.18a10.9 10.9 0 0 1 5.72 0c2.18-1.49 3.14-1.18 3.14-1.18.62 1.58.23 2.74.11 3.03.73.8 1.18 1.82 1.18 3.08 0 4.44-2.7 5.42-5.27 5.71.41.36.77 1.08.77 2.18v3.23c0 .3.21.66.79.55A11.53 11.53 0 0 0 23.5 12C23.5 5.66 18.35.5 12 .5z"/>
            </svg>
          </div>

          <div>
            <div className="github-title">
              GitHub Verification
            </div>

            <div className="github-subtitle">
              Connect your GitHub account
            </div>
          </div>
        </div>

        {isConnected && (
          <div className="status">
            <div className="status-user">
              @{githubUser}
            </div>
          </div>
        )}

        {!isConnected ? (
          <>
            <button
              className="btn"
              onClick={connectGithub}
              disabled={loading}
            >
              {loading
                ? "Connecting..."
                : "Connect GitHub"}
            </button>

            {onSkip && (
              <>
                <div className="skip-divider">
                  <span>OR</span>
                </div>

                <button
                  type="button"
                  className="skip-btn"
                  onClick={onSkip}
                  disabled={skipping}
                >
                  {skipping ? (
                    "Skipping..."
                  ) : (
                    <>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="13 17 18 12 13 7" />
                        <polyline points="6 17 11 12 6 7" />
                      </svg>
                      I don&apos;t have relevant public repos
                    </>
                  )}
                </button>
              </>
            )}
          </>
        ) : (
          <button
            className="btn disconnect-btn"
            onClick={disconnectGithub}
            disabled={loading}
          >
            Disconnect GitHub
          </button>
        )}
      </div>
    </>
  );
}