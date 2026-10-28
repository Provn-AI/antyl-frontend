import { ImageResponse } from "next/og";
import { getPublicScore } from "@/services/developer.service";

export const alt = "Antyl score";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = await getPublicScore(slug);

  const name = s?.name ?? "Antyl Developer";
  const score = s?.trust_score ?? "--";
  const initial = name.trim().charAt(0).toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "linear-gradient(135deg, #fffaf5 0%, #ffe8d6 55%, #ffd9a8 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 34, fontWeight: 800, color: "#F2754A" }}>
          Antyl
          <span style={{ marginLeft: 16, fontSize: 22, color: "#6b7280", fontWeight: 600 }}>
            Verified developer score
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 300,
              height: 300,
              borderRadius: 150,
              border: "24px solid #F2754A",
              background: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 120,
              fontWeight: 900,
              color: "#111827",
            }}
          >
            {score}
          </div>

          <div style={{ display: "flex", flexDirection: "column", marginLeft: 56, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  background: "#F2754A",
                  color: "white",
                  fontSize: 34,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 20,
                }}
              >
                {initial}
              </div>
              <div style={{ fontSize: 56, fontWeight: 900, color: "#111827" }}>{name}</div>
            </div>

            {s?.current_role && (
              <div style={{ fontSize: 30, color: "#4b5563", marginTop: 12 }}>{s.current_role}</div>
            )}

            <div style={{ display: "flex", flexWrap: "wrap", marginTop: 28 }}>
              {(s?.top_skills ?? []).slice(0, 5).map((skill) => (
                <div
                  key={skill}
                  style={{
                    background: "white",
                    color: "#F2754A",
                    fontSize: 26,
                    fontWeight: 700,
                    padding: "8px 22px",
                    borderRadius: 999,
                    marginRight: 12,
                    marginBottom: 12,
                  }}
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ fontSize: 24, color: "#6b7280" }}>
          Verified from real code and GitHub work · antyl.org
        </div>
      </div>
    ),
    { ...size }
  );
}