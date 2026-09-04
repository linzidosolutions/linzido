"use client";

/**
 * Static stand-in for the WebGL workshop, used on small screens, machines
 * without WebGL, and whenever reduced motion is requested. Pure CSS — no
 * canvas, no animation loop, no measurable cost.
 */
export default function FlatBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 70% 28%, rgba(196,26,46,0.20), transparent 60%), radial-gradient(ellipse 60% 50% at 18% 72%, rgba(77,109,255,0.14), transparent 55%)",
        }}
      />
      {/* Faint desk-plane suggestion so the space still reads as a room */}
      <div
        className="absolute inset-x-0 bottom-0 h-[45vh]"
        style={{
          background:
            "linear-gradient(to top, rgba(196,26,46,0.06), transparent 70%)",
        }}
      />
    </div>
  );
}
