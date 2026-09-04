import { ImageResponse } from "next/og";
import { getCompanySettings, getTeamMembers } from "@/lib/payload-data";

export const alt = "Linzido — engineering the systems businesses run on";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Generated from live Company Settings / Team Members instead of hardcoded
// copy, so a positioning or team change in /admin updates every social-share
// preview automatically instead of silently going stale.
export default async function OG() {
  const [company, team] = await Promise.all([getCompanySettings(), getTeamMembers()]);
  const founders = team.filter((t) => t.role.toLowerCase().includes("founder"));
  const byline = founders.length
    ? `${founders.map((f) => f.name).join(" & ")} · ${founders.length > 1 ? "Founders" : founders[0].role}`
    : company.name;
  const [line1, line2] = splitTagline(company.tagline);

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background:
            "radial-gradient(60% 80% at 20% 0%, #2a0f12 0%, transparent 55%), radial-gradient(60% 80% at 100% 100%, #1a0d0e 0%, transparent 55%), #080808",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 34 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              border: "2px solid #e53935",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#e53935",
              fontWeight: 700,
            }}
          >
            L
          </div>
          <span style={{ fontWeight: 600 }}>{company.name}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 70, fontWeight: 600, lineHeight: 1.05, letterSpacing: -2 }}>
            {line1}
          </div>
          {line2 && (
            <div
              style={{
                fontSize: 70,
                fontWeight: 600,
                lineHeight: 1.05,
                letterSpacing: -2,
                backgroundImage: "linear-gradient(90deg,#ffffff,#ff8a80)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {line2}
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "rgba(255,255,255,0.6)" }}>
          <span>{byline}</span>
          <span>Web · CRM · Automation · AI</span>
        </div>
      </div>
    ),
    { ...size }
  );
}

/** Splits a tagline into two roughly-even lines for the OG image layout. */
function splitTagline(tagline: string): [string, string | undefined] {
  const words = tagline.split(" ");
  if (words.length < 4) return [tagline, undefined];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}
