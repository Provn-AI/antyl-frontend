import { ImageResponse } from "next/og";
import { getPublicScore } from "@/services/developer.service";
import { scoreArtDataUri, SCORE_ART_RATIO, SCORE_ART_RING_CENTER_Y } from "@/lib/scoreArt";

export const alt = "Antyl score";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = await getPublicScore(slug);

  const name = s?.name ?? "Antyl Developer";
  const role = s?.current_role ?? "";
  const score = String(s?.trust_score ?? "--");

  const ART_H = 350;
  const ART_W = Math.round(ART_H * SCORE_ART_RATIO);
  const NUM_SIZE = 120;
  const numTop = Math.round(SCORE_ART_RING_CENTER_Y * ART_H - NUM_SIZE * 0.62);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#ffffff",
          padding: 22,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            borderRadius: 56,
            border: "2px solid #FBE3D0",
            background: "linear-gradient(135deg, #FFF3E6 0%, #FFFAF4 55%, #FFF6EC 100%)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#FCE9DE",
              borderRadius: 999,
              padding: "10px 40px",
            }}
          >
            <div style={{ width: 34, height: 4, borderRadius: 2, background: "#F2754A" }} />
            <div
              style={{
                margin: "0 22px",
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: 8,
                color: "#3B4A63",
              }}
            >
              ANTYL SCORE
            </div>
            <div style={{ width: 34, height: 4, borderRadius: 2, background: "#F2754A" }} />
          </div>

          <div style={{ display: "flex", position: "relative", width: ART_W, height: ART_H, marginTop: 6 }}>
            <img src={scoreArtDataUri()} width={ART_W} height={ART_H} />
            <div
              style={{
                position: "absolute",
                left: 0,
                top: numTop,
                width: ART_W,
                height: NUM_SIZE + 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: NUM_SIZE,
                fontWeight: 900,
                color: "#14213D",
              }}
            >
              {score}
            </div>
          </div>

          <div style={{ display: "flex", fontSize: 54, fontWeight: 800, color: "#14213D", marginTop: 2 }}>
            {name}
          </div>

          {role ? (
            <div
              style={{
                display: "flex",
                marginTop: 12,
                background: "#FCE8DC",
                color: "#475569",
                fontSize: 28,
                fontWeight: 600,
                padding: "8px 38px",
                borderRadius: 999,
              }}
            >
              {role}
            </div>
          ) : null}
        </div>
      </div>
    ),
    { ...size }
  );
}