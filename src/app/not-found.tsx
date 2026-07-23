"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Fraunces:opsz,wght@9..144,600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .page-wrap {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          background: #F8F5F0;
          font-family: 'DM Sans', sans-serif;
          -webkit-font-smoothing: antialiased;
          text-align: center;
        }

        .content {
          max-width: 420px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .logo {
          font-family: 'Fraunces', serif;
          font-size: 22px;
          font-weight: 600;
          background: linear-gradient(90deg, #FF6B4D, #FFB347);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-decoration: none;
          display: inline-block;
          margin-bottom: 2.5rem;
          letter-spacing: -0.02em;
        }

        .error-code {
          font-family: 'Fraunces', serif;
          font-size: 96px;
          font-weight: 600;
          line-height: 1;
          background: linear-gradient(90deg, #FF6B4D, #FFB347);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.03em;
          margin-bottom: 1rem;
        }

        .error-title {
          font-size: 22px;
          font-weight: 700;
          color: #1A1A1A;
          letter-spacing: -0.02em;
          margin-bottom: 0.625rem;
        }

        .error-sub {
          font-size: 14.5px;
          color: #B0A89E;
          font-weight: 400;
          line-height: 1.5;
          margin-bottom: 2.25rem;
        }

        .btn-home {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: linear-gradient(90deg, #FF6B4D, #FFB347);
          color: white;
          border: none;
          padding: 14px 32px;
          border-radius: 50px;
          font-size: 14.5px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: -0.01em;
          text-decoration: none;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 4px 20px rgba(255,107,77,0.28);
        }

        .btn-home:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(255,107,77,0.36);
        }
      `}</style>

      <div className="page-wrap">
        <div className="content">
          <Link href="/" className="logo">Antyl</Link>
          <div className="error-code">404</div>
          <h1 className="error-title">Page not found</h1>
          <p className="error-sub">
            The page you are looking for does not exist or may have been moved.
          </p>
          <Link href="/" className="btn-home">
            Back to home
          </Link>
        </div>
      </div>
    </>
  );
}