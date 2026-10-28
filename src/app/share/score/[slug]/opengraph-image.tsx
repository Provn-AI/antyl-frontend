import { ImageResponse } from "next/og";
import { getPublicScore } from "@/services/developer.service";
import { assetUrl, MASCOT_PATH } from "@/lib/shareAssests";

export const alt = "Antyl score";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = await getPublicScore(slug);

  const name = s?.name ?? "Antyl Developer";
  const score = s?.trust_score ?? "--";
  const mascot = assetUrl(MASCOT_PATH)!;
  const badges = (s?.badges ?? []).slice(0, 4);
  const skills = (s?.top_skills ?? []).slice(0, 4);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "44px 56px",
          background: "linear-gradient(135deg, #fffaf5 0%, #ffe8d6 55%, #ffd9a8 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ fontSize: 34, fontWeight: 800, color: "#F2754A" }}>Antyl</div>
          <div style={{ marginLeft: 16, fontSize: 22, color: "#6b7280", fontWeight: 600 }}>
            Verified developer score
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src={mascot}
            width={290}
            height={290}
            style={{ objectFit: "contain", marginRight: 36 }}
          />

          <div
            style={{
              width: 230,
              height: 230,
              borderRadius: 115,
              border: "20px solid #F2754A",
              background: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 96,
              fontWeight: 900,
              color: "#111827",
              flexShrink: 0,
            }}
          >
            {score}
          </div>

          <div style={{ display: "flex", flexDirection: "column", marginLeft: 44, flex: 1 }}>
            <div style={{ fontSize: 50, fontWeight: 900, color: "#111827" }}>{name}</div>
            {s?.current_role ? (
              <div style={{ fontSize: 26, color: "#4b5563", marginTop: 8 }}>{s.current_role}</div>
            ) : null}
            <div style={{ display: "flex", flexWrap: "wrap", marginTop: 22 }}>
              {skills.map((skill) => (
                <div
                  key={skill}
                  style={{
                    background: "white",
                    color: "#F2754A",
                    fontSize: 22,
                    fontWeight: 700,
                    padding: "6px 18px",
                    borderRadius: 999,
                    marginRight: 10,
                    marginBottom: 10,
                  }}
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            {badges.map((b) => {
              const img = assetUrl(b.image);
              return (
                <div
                  key={b.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    background: "white",
                    border: `3px solid ${b.color}`,
                    borderRadius: 999,
                    padding: "6px 22px 6px 8px",
                    marginRight: 14,
                  }}
                >
                  {img ? (
                    <img src={img} width={52} height={52} style={{ objectFit: "contain" }} />
                  ) : null}
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#374151", marginLeft: 10 }}>
                    {b.label}
                    {b.count > 1 ? ` ×${b.count}` : ""}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: 22, color: "#6b7280" }}>antyl.org</div>
        </div>
      </div>
    ),
    { ...size }
  );
}