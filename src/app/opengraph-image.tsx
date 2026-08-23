import { ImageResponse } from "next/og";
import { company } from "@/data/company";

export const dynamic = "force-static";
export const alt = `${company.name} — ${company.legalPositioning}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0d0b",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 40,
            border: "1px solid #3a352a",
            display: "flex",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 116,
            height: 116,
            borderRadius: "50%",
            border: "2px solid #c8a668",
            marginBottom: 36,
          }}
        >
          <svg width="72" height="72" viewBox="0 0 256 256">
            <path
              d="M128 26 L144 118 L230 128 L144 138 L128 230 L112 138 L26 128 L112 118 Z"
              fill="#c8a668"
            />
            <circle cx="128" cy="128" r="10" fill="#0a0d0b" />
            <circle cx="128" cy="128" r="10" fill="none" stroke="#c8a668" strokeWidth="2.5" />
          </svg>
        </div>
        <div
          style={{
            display: "flex",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: 60,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "#f4efe4",
          }}
        >
          World Bridge Meridian
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 22,
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: 24,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#a89d87",
          }}
        >
          Bespoke Travel Group
        </div>
      </div>
    ),
    { ...size },
  );
}
