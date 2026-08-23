import { ImageResponse } from "next/og";
import { company } from "@/data/company";

export const dynamic = "force-static";
export const alt = `${company.name} — Independent Global Travel Company`;
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
            width: 108,
            height: 108,
            borderRadius: "50%",
            border: "3px solid #c8a668",
            marginBottom: 36,
          }}
        >
          <span
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: 64,
              color: "#c8a668",
            }}
          >
            M
          </span>
        </div>
        <div
          style={{
            display: "flex",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: 68,
            color: "#f4efe4",
            letterSpacing: 1,
          }}
        >
          <span style={{ marginRight: 16 }}>World Bridge</span>
          <span style={{ fontStyle: "italic", color: "#c8a668" }}>Meridian</span>
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
          Independent Global Travel
        </div>
      </div>
    ),
    { ...size },
  );
}
