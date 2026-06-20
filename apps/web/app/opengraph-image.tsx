import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Bhargav — Developer Portfolio";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          padding: "80px",
          width: "100%",
          height: "100%",
          background: "#faf9f7",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            fontSize: 20,
            color: "#999999",
            textTransform: "uppercase",
            letterSpacing: "0.25em",
            marginBottom: 32,
          }}
        >
          bhargav.dev
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: "#1a1a1a",
            lineHeight: 1,
            marginBottom: 20,
          }}
        >
          Bhargav
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#666666",
            fontStyle: "italic",
          }}
        >
          Product-focused developer · Building intentional interfaces
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
