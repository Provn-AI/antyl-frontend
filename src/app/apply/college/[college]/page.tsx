import Link from "next/link";
import type { Metadata } from "next";
import fs from "fs";
import path from "path";

const SIGNUP_PATH = "/signup";
const LOGIN_PATH = "/login";
const ANTYL_LOGO = "/Antyl.png"; // frontend/public/Antyl.png

type Props = { params: Promise<{ college: string }> };

// "christ-university" -> "Christ University"
function formatName(slug: string) {
  let decoded = slug;
  try {
    decoded = decodeURIComponent(slug);
  } catch {
    // malformed encoding, use slug as-is
  }
  return decoded
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// "Christ University" -> "CU"
function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

// Looks for /public/colleges/<slug>.png, returns null if it does not exist
function findLogo(slug: string) {
  if (!/^[a-z0-9-]+$/i.test(slug)) return null;
  const lower = slug.toLowerCase();
  const file = path.join(process.cwd(), "public", "colleges", `${lower}.png`);
  return fs.existsSync(file) ? `/colleges/${lower}.png` : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { college } = await params;
  const name = formatName(college);
  return {
    title: `${name} x Antyl | Get Verified`,
    description: `${name} students: build a verified developer profile on Antyl and get discovered by recruiters.`,
    openGraph: {
      title: `${name} x Antyl | Get Verified`,
      description: `${name} students: build a verified developer profile on Antyl.`,
    },
  };
}

const STEPS = [
  {
    title: "Create your account",
    text: "Sign up with your email and confirm it with a one-time code.",
  },
  {
    title: "Verify your skills",
    text: "Connect your GitHub and projects. Your skills get verified, not just listed.",
  },
  {
    title: "Get discovered",
    text: "Recruiters hiring interns and freshers can find you before placement season.",
  },
];

export default async function CollegeApplyPage({ params }: Props) {
  const { college } = await params;
  const name = formatName(college);
  const logo = findLogo(college);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Fraunces:opsz,wght@9..144,600&display=swap');

        .ap-wrap, .ap-wrap *, .ap-wrap *::before, .ap-wrap *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .ap-wrap {
          min-height: 100vh;
          min-height: 100dvh;
          width: 100%;
          display: flex;
          flex-direction: column;
          background: #F8F5F0;
          font-family: 'DM Sans', sans-serif;
          -webkit-font-smoothing: antialiased;
          color: #1A1A1A;
        }

        /* ── Header ── */
        .ap-header {
          width: 100%;
          max-width: 1120px;
          margin: 0 auto;
          padding: 0.75rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .ap-logo {
          display: flex;
          align-items: center;
          text-decoration: none;
        }

        .ap-logo-img {
          height: 72px;
          width: auto;
          display: block;
        }

        .ap-header-link {
          font-size: 14px;
          font-weight: 600;
          color: #1A1A1A;
          text-decoration: none;
          padding: 9px 18px;
          border: 1.5px solid #E8E4DF;
          border-radius: 50px;
          background: #FFFFFF;
          transition: border-color 0.15s;
        }

        .ap-header-link:hover {
          border-color: #B0A89E;
        }

        /* ── Main ── */
        .ap-main {
          flex: 1;
          width: 100%;
          max-width: 1120px;
          margin: 0 auto;
          padding: 1.5rem 1.25rem 2.5rem;
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
          align-items: center;
        }

        /* ── College logo ── */
        .ap-cobrand {
          display: flex;
          align-items: center;
          margin-bottom: 1.75rem;
        }

        .ap-cobrand-logo {
          height: 88px;
          width: auto;
          max-width: 260px;
          object-fit: contain;
          border-radius: 16px;
          background: #FFFFFF;
          padding: 10px 14px;
          border: 1.5px solid #E8E4DF;
          display: block;
        }

        .ap-cobrand-initials {
          min-width: 88px;
          height: 88px;
          padding: 0 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          background: #FFFFFF;
          border: 1.5px solid #E8E4DF;
          font-weight: 700;
          font-size: 24px;
          letter-spacing: -0.02em;
        }

        .ap-eyebrow {
          display: inline-block;
          font-size: 12px;
          font-weight: 700;
          color: #FF6B4D;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          background: #FFF0EA;
          padding: 7px 14px;
          border-radius: 50px;
          margin-bottom: 1.25rem;
        }

        .ap-title {
          font-size: clamp(32px, 7vw, 56px);
          font-weight: 700;
          letter-spacing: -0.035em;
          line-height: 1.1;
          margin-bottom: 1.125rem;
        }

        .ap-role {
          display: block;
          background: linear-gradient(90deg, #FF6B4D, #FFB347);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .ap-lead {
          font-size: clamp(15px, 2.2vw, 18px);
          color: #6B645C;
          line-height: 1.65;
          margin-bottom: 0.75rem;
          max-width: 520px;
        }

        .ap-lead strong {
          color: #1A1A1A;
          font-weight: 600;
        }

        .ap-thanks {
          font-size: 14.5px;
          color: #B0A89E;
          line-height: 1.6;
          margin-bottom: 1.75rem;
          max-width: 520px;
        }

        .ap-btn {
          width: 100%;
          background: linear-gradient(90deg, #FF6B4D, #FFB347);
          color: #FFFFFF;
          border: none;
          padding: 17px 36px;
          border-radius: 50px;
          font-size: 16px;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: -0.01em;
          text-decoration: none;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 4px 20px rgba(255,107,77,0.28);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .ap-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(255,107,77,0.36);
        }

        .ap-foot {
          font-size: 14px;
          color: #B0A89E;
        }

        .ap-foot a {
          color: #FF6B4D;
          font-weight: 700;
          text-decoration: none;
        }

        .ap-foot a:hover {
          text-decoration: underline;
        }

        /* ── Steps card ── */
        .ap-card {
          background: #FFFFFF;
          border-radius: 24px;
          padding: 1.5rem 1.25rem;
          box-shadow: 0 2px 24px rgba(0,0,0,0.06);
        }

        .ap-card-title {
          font-size: 18px;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin-bottom: 1.25rem;
        }

        .ap-steps {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .ap-step {
          display: flex;
          gap: 14px;
          align-items: flex-start;
        }

        .ap-step-num {
          flex-shrink: 0;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(90deg, #FF6B4D, #FFB347);
          color: #FFFFFF;
          font-size: 15px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ap-step-title {
          font-size: 15.5px;
          font-weight: 600;
          letter-spacing: -0.01em;
          margin-bottom: 3px;
        }

        .ap-step-text {
          font-size: 14px;
          color: #8A8279;
          line-height: 1.55;
        }

        /* ── Footer ── */
        .ap-footer {
          text-align: center;
          font-size: 12.5px;
          color: #B0A89E;
          padding: 0 1.25rem 1.5rem;
        }

        /* ── Tablet and up ── */
        @media (min-width: 640px) {
          .ap-header { padding: 1rem 2rem; }
          .ap-logo-img { height: 96px; }
          .ap-main { padding: 2rem 2rem 3rem; }
          .ap-card { padding: 2rem; }
          .ap-btn { width: auto; min-width: 220px; }
          .ap-cobrand-logo { height: 104px; }
          .ap-cobrand-initials { height: 104px; min-width: 104px; }
        }

        /* ── Desktop: two columns ── */
        @media (min-width: 900px) {
          .ap-main {
            grid-template-columns: 1.15fr 1fr;
            gap: 4rem;
          }
          .ap-card { padding: 2.5rem; }
        }
      `}</style>

      <div className="ap-wrap">
        <header className="ap-header">
          <Link href="/" className="ap-logo" aria-label="Antyl home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ANTYL_LOGO} alt="Antyl" className="ap-logo-img" />
          </Link>
          <Link href={LOGIN_PATH} className="ap-header-link">
            Log in
          </Link>
        </header>

        <main className="ap-main">
          <section>
            <div className="ap-cobrand">
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt={`${name} logo`} className="ap-cobrand-logo" />
              ) : (
                <span className="ap-cobrand-initials">{initials(name)}</span>
              )}
            </div>

            <span className="ap-eyebrow">Campus partner</span>
            <h1 className="ap-title">
              Verified skills for
              <span className="ap-role">{name} students</span>
            </h1>
            <p className="ap-lead">
              <strong>Build your verified developer profile before you graduate.</strong>{" "}
              Prove your skills once and get seen by teams hiring interns and
              freshers.
            </p>
            <p className="ap-thanks">
              Free for {name} students. It takes only a few minutes to get
              started.
            </p>

            <Link
              href={`${SIGNUP_PATH}?college=${encodeURIComponent(college)}`}
              className="ap-btn"
            >
              Get verified
            </Link>

            <p className="ap-foot">
              Already have an account? <Link href={LOGIN_PATH}>Log in</Link>
            </p>
          </section>

          <aside className="ap-card">
            <h2 className="ap-card-title">How it works</h2>
            <ol className="ap-steps">
              {STEPS.map((s, i) => (
                <li key={s.title} className="ap-step">
                  <span className="ap-step-num">{i + 1}</span>
                  <div>
                    <p className="ap-step-title">{s.title}</p>
                    <p className="ap-step-text">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </aside>
        </main>

        <footer className="ap-footer">
          &copy; {new Date().getFullYear()} Antyl. All rights reserved.
        </footer>
      </div>
    </>
  );
}