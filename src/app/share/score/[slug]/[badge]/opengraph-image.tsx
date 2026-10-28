import { ImageResponse } from "next/og";
import { getPublicBadge } from "@/services/developer.service";
import { assetUrl, MASCOT_PATH } from "@/lib/shareAssests";

export const alt = "Antyl badge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string; badge: string }>;
}) {
  const { slug, badge } = await params;
  const d = await getPublicBadge(slug, badge);
  const b = d?.badge;

  const color = b?.color ?? "#F2754A";
  const badgeImg = assetUrl(b?.image);
  const mascot = assetUrl(MASCOT_PATH)!;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px 64px",
          background: "linear-gradient(135deg, #fffaf5 0%, #ffe8d6 55%, #ffd9a8 100%)",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ fontSize: 34, fontWeight: 800, color: "#F2754A" }}>Antyl</div>
          <div style={{ marginLeft: 16, fontSize: 22, color: "#6b7280", fontWeight: 600 }}>
            Badge earned
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 300,
              height: 300,
              borderRadius: 150,
              border: `16px solid ${color}`,
              background: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {badgeImg ? (
              <img src={badgeImg} width={190} height={190} style={{ objectFit: "contain" }} />
            ) : null}
          </div>

          <div style={{ display: "flex", flexDirection: "column", marginLeft: 56, maxWidth: 540 }}>
            <div style={{ fontSize: 68, fontWeight: 900, color: "#111827", lineHeight: 1.05 }}>
              {b?.label ?? "Antyl Badge"}
            </div>
            {b?.description ? (
              <div style={{ fontSize: 28, color: "#4b5563", marginTop: 14 }}>{b.description}</div>
            ) : null}

            <div style={{ display: "flex", flexWrap: "wrap", marginTop: 22 }}>
              {b?.rank != null ? (
                <div
                  style={{
                    background: "white",
                    color: "#F2754A",
                    fontSize: 24,
                    fontWeight: 700,
                    padding: "6px 20px",
                    borderRadius: 999,
                    marginRight: 10,
                  }}
                >
                  {`Rank #${b.rank}`}
                </div>
              ) : null}
              {b?.field_label ? (
                <div
                  style={{
                    background: "white",
                    color: "#6b7280",
                    fontSize: 24,
                    fontWeight: 700,
                    padding: "6px 20px",
                    borderRadius: 999,
                    marginRight: 10,
                  }}
                >
                  {b.field_label}
                </div>
              ) : null}
            </div>

            <div style={{ fontSize: 30, fontWeight: 800, color: "#111827", marginTop: 26 }}>
              {d?.name ?? ""}
            </div>
            {d?.current_role ? (
              <div style={{ fontSize: 22, color: "#6b7280", marginTop: 4 }}>{d.current_role}</div>
            ) : null}
          </div>
        </div>

        <div style={{ fontSize: 22, color: "#6b7280" }}>antyl.org</div>

        <img
          src={mascot}
          width={210}
          height={210}
          style={{ position: "absolute", right: 40, bottom: 28, objectFit: "contain" }}
        />
      </div>
    ),
    { ...size }
  );
}