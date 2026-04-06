import { ImageResponse } from "next/og";

export const alt = "Ana Harff — Fotografía analógica · Buenos Aires";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f7f5f0",
          color: "#1a1a1a",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            fontSize: 76,
            fontWeight: 300,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
          }}
        >
          Ana Harff
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 30,
            color: "#5c4d3d",
            fontWeight: 300,
            letterSpacing: "0.06em",
            textTransform: "uppercase" as const,
          }}
        >
          Fotografía analógica
        </div>
        <div style={{ marginTop: 16, fontSize: 22, color: "#8c8c8c", fontWeight: 300 }}>
          Buenos Aires
        </div>
      </div>
    ),
    { ...size }
  );
}
