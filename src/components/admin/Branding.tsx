/**
 * Admin branding — the nav icon and login-page logo Payload lets you swap
 * via admin.components.graphics.{Icon,Logo}. These run inside Payload's own
 * admin layout (no Tailwind, no site globals.css), so styling is inline and
 * self-contained on purpose.
 *
 * The "®" mark only ever appears attached to the "LINZIDO" wordmark (as on
 * the public site) — a bare ® with no company name next to it just reads as
 * a random letter. Anywhere the icon has to stand alone (nav rail, favicon)
 * it's an "LS" monogram (Linzido Solutions) instead.
 */

const RED = "#e53935";

/** Standalone mark — used wherever there's no "LINZIDO" text alongside it. */
export function Icon() {
  return (
    <svg viewBox="0 0 100 100" width="24" height="24" aria-hidden>
      <circle cx="50" cy="50" r="46" fill="#0a0a0a" />
      <circle cx="50" cy="50" r="46" fill="none" stroke={RED} strokeWidth="4" />
      <text
        x="50"
        y="54"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="700"
        fontSize="38"
        letterSpacing="-1"
        fill={RED}
      >
        LS
      </text>
    </svg>
  );
}

/** The registered-trademark mark — only ever rendered next to "LINZIDO" text. */
function TrademarkMark() {
  return (
    <svg viewBox="0 0 100 100" width="20" height="20" aria-hidden>
      <circle cx="50" cy="50" r="43" fill="none" stroke={RED} strokeWidth="9" />
      <path
        d="M33 24 h18 c10 0 16 6 16 14 c0 7-5 12-13 13 l14 25 h-10 L44 51 H42 v25 H33 Z
           M42 33 v11 h8 c5 0 8-2 8-6 s-3-5-8-5 Z"
        fill={RED}
      />
    </svg>
  );
}

/** Full wordmark — "LINZIDO" in Bebas Neue (loaded via custom.css) + ®. */
export function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span
        style={{
          fontFamily: "'Bebas Neue', Impact, sans-serif",
          fontWeight: 400,
          fontSize: 28,
          letterSpacing: "0.1em",
          lineHeight: 1,
          color: "#f0ece4",
        }}
      >
        LINZIDO
      </span>
      <TrademarkMark />
    </div>
  );
}
