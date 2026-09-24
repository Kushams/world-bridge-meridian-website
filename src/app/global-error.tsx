"use client";

/**
 * Replaces the root layout entirely when rendering it fails, so it can't
 * rely on the site's fonts, header or design tokens — styles are inline.
 */
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0d0b",
          color: "#f4efe4",
          fontFamily: "Georgia, serif",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 400 }}>
            World Bridge Meridian is temporarily unavailable.
          </h1>
          <p style={{ color: "#a6a093", fontFamily: "system-ui, sans-serif" }}>
            Please try again in a moment, or write to info@worldbridgemeridian.group.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              borderRadius: "999px",
              border: "none",
              background: "#f4efe4",
              color: "#0a0d0b",
              padding: "0.75rem 1.5rem",
              fontFamily: "system-ui, sans-serif",
              fontSize: "0.8rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
