"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Logo from "@/components/ui/Logo";
import { prefersReducedMotion } from "@/lib/utils";

const INTRO_SHOWN_KEY = "linzido-intro-shown";

// sessionStorage throws in some privacy modes (Safari private browsing with
// certain settings, sandboxed iframes) — treat that the same as "not shown
// yet" rather than crashing the page.
function hasShownIntro() {
  try {
    return sessionStorage.getItem(INTRO_SHOWN_KEY) === "1";
  } catch {
    return false;
  }
}
function markIntroShown() {
  try {
    sessionStorage.setItem(INTRO_SHOWN_KEY, "1");
  } catch {
    // Nothing to fall back to — worst case the intro replays next load.
  }
}

/**
 * First-paint experience: black screen, animated counter 0→100, logo
 * reveal, then a panel wipe that uncovers the page. Locks scroll while
 * active and calls onDone so the hero can start its entrance.
 *
 * Only plays in full once per browser session — a returning visitor
 * clicking back to "/" or reloading shouldn't have to sit through the same
 * ~2.25s cinematic intro again just to reach content they've already seen.
 */
export default function Preloader({ onDone }: { onDone: () => void }) {
  // Always starts at 0 — both prefersReducedMotion() and hasShownIntro()
  // read browser-only state (matchMedia / sessionStorage) that doesn't exist
  // during SSR. Branching the initial render on either one here would make
  // the client's first render disagree with the server-rendered HTML
  // (server always sees the "not yet shown" case) and trip a hydration
  // mismatch. The effect below re-checks both immediately after mount,
  // client-only, and fast-forwards from there instead.
  const [count, setCount] = useState(0);
  const [hidden, setHidden] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  // Held in a ref so a re-render of the parent (which passes an inline arrow)
  // can't retrigger the effect below — doing so cancelled the RAF and restarted
  // the counter from zero, leaving the overlay up and body scroll locked.
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  });

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const finish = () => {
      const tl = gsap.timeline({
        onComplete: () => {
          setHidden(true);
          document.body.style.overflow = "";
          markIntroShown();
          onDoneRef.current();
        },
      });
      tl.to(".pl-content", { y: -30, opacity: 0, duration: 0.5, ease: "power2.in" })
        .to(rootRef.current, {
          yPercent: -100,
          duration: 0.9,
          ease: "power4.inOut",
        }, "-=0.1");
    };

    if (prefersReducedMotion() || hasShownIntro()) {
      setCount(100);
      const t = setTimeout(() => {
        setHidden(true);
        document.body.style.overflow = "";
        onDoneRef.current();
      }, 400);
      return () => clearTimeout(t);
    }

    const start = performance.now();
    const dur = 2000;
    let raf = 0;
    let settled = false;

    const release = () => {
      if (settled) return;
      settled = true;
      cancelAnimationFrame(raf);
      finish();
    };

    // Skips the GSAP wipe entirely. GSAP's ticker is itself frame-driven, so a
    // failsafe that animated its way out would stall for the same reason the
    // counter did. This just reveals the page.
    const hardRelease = () => {
      if (settled) return;
      settled = true;
      cancelAnimationFrame(raf);
      setHidden(true);
      document.body.style.overflow = "";
      onDoneRef.current();
    };

    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(eased * 100));
      if (barRef.current) barRef.current.style.transform = `scaleX(${eased})`;
      if (p < 1) raf = requestAnimationFrame(tick);
      else setTimeout(release, 250);
    };
    raf = requestAnimationFrame(tick);

    // requestAnimationFrame is suspended while the tab is in the background, so
    // a page opened in a background tab would sit at 0% with body scroll locked
    // until it is focused. This timer is not frame-driven and always releases.
    const failsafe = setTimeout(hardRelease, dur + 2500);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(failsafe);
    };
    // Runs exactly once per mount — see onDoneRef above.
  }, []);

  if (hidden) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#050505]"
    >
      <div className="pl-content flex flex-col items-center gap-8">
        <div style={{ animation: "pulse-glow 2s ease-in-out infinite" }}>
          <Logo className="text-3xl" />
        </div>
        <div className="h-px w-56 overflow-hidden bg-white/10">
          <div
            ref={barRef}
            className="h-full w-full origin-left bg-gradient-to-r from-white to-[#4d6dff]"
            style={{ transform: "scaleX(0)" }}
          />
        </div>
      </div>
      <div className="absolute bottom-10 left-0 right-0 flex flex-col items-start gap-3 px-8 sm:flex-row sm:items-end sm:justify-between md:px-14">
        <span className="eyebrow">Loading experience</span>
        <span className="font-display text-4xl font-medium tabular-nums sm:text-6xl md:text-8xl">
          {count}
          <span className="text-[#4d6dff]">%</span>
        </span>
      </div>
    </div>
  );
}
