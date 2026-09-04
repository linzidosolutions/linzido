"use client";

import { useEffect, useRef } from "react";
import { registerGsap, gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";
import { useStageMode } from "@/hooks/useStageMode";
import type { ProcessStep } from "@/payload-types";

/**
 * Horizontally-scrolling process. On desktop, a tall wrapper reserves the
 * scroll distance and the visible content is held in place with native CSS
 * `position: sticky` while GSAP scrubs the horizontal track and progress
 * rail — no `pin: true` involved.
 *
 * That's deliberate: this used to be a GSAP-pinned ScrollTrigger, but with
 * WorkshopDriver's 10,000px pin earlier on the page, GSAP's own "top top"
 * resolution for this section's pin was measuring its start ~10,000px too
 * early — confirmed via ScrollTrigger.getAll() — regardless of whether that
 * position was expressed as a string, a function, or re-measured on refresh.
 * So this reads its own position directly off the DOM once (a plain number,
 * which GSAP uses as-is instead of resolving later) and pins nothing itself
 * — sticky positioning is native browser layout, immune to that cycle.
 *
 * `stage` starts "flat" on every load and upgrades to "3d" once WorkshopDriver
 * (and its 10,000px pin) mounts (see useStageMode) — this effect has to
 * re-run after that settles, or its own one-time DOM read would freeze in
 * the pre-3D, ~10,000px-too-short position instead.
 *
 * On mobile / reduced-motion it gracefully degrades to a vertical stack.
 */
export default function Process({ steps }: { steps: ProcessStep[] }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stage = useStageMode();

  useEffect(() => {
    registerGsap();
    if (prefersReducedMotion()) return;
    const mm = gsap.matchMedia();

    mm.add("(min-width: 900px)", () => {
      const wrapper = wrapperRef.current!;
      const track = trackRef.current!;
      const distance = track.scrollWidth - window.innerWidth;
      const scrollSpace = distance + window.innerHeight * 0.6;

      wrapper.style.height = `calc(100vh + ${scrollSpace}px)`;

      // Plain numbers, not "top top"/"bottom bottom" strings (and not even a
      // start/end *function* — tried that too). GSAP's own resolution of
      // this trigger's position, whenever it measures it (string, function,
      // or on refresh), lands ~10,000px too early — the exact size of
      // WorkshopDriver's preceding pin — regardless of how the value is
      // expressed. Reading the DOM ourselves, once, synchronously, right
      // here gives the correct number every time; handing GSAP anything it
      // resolves later does not.
      const startPx = wrapper.getBoundingClientRect().top + window.scrollY;
      const endPx = startPx + scrollSpace;

      const tween = gsap.to(track, {
        x: -distance,
        ease: "none",
        scrollTrigger: {
          trigger: wrapper,
          start: startPx,
          end: endPx,
          scrub: 1,
        },
      });

      const railTween = gsap.to(".proc-rail-fill", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: wrapper,
          start: startPx,
          end: endPx,
          scrub: 1,
        },
      });

      return () => {
        tween.kill();
        railTween.kill();
        wrapper.style.height = "";
      };
    });

    return () => mm.revert();
  }, [stage]);

  return (
    <section id="process" className="relative bg-bg-2">
      <div ref={wrapperRef} className="relative">
        <div className="sticky top-0 overflow-hidden py-20 md:h-[100svh] md:py-0">
          <div className="container-x flex h-full flex-col justify-center">
            <div className="flex items-end justify-between pt-8 md:pt-0">
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <span className="h-px w-8 bg-accent" />
                  <span className="eyebrow">Process</span>
                </div>
                <h2 className="display-md max-w-xl">How we build something that has to keep working.</h2>
              </div>
              <span className="hidden font-mono text-sm text-fg-faint md:block">
                {steps.length} stages
              </span>
            </div>

            {/* progress rail */}
            <div className="mt-10 hidden h-px w-full bg-line md:block">
              <div className="proc-rail-fill h-full w-full origin-left scale-x-0 bg-accent" />
            </div>

            {/* track */}
            <div
              ref={trackRef}
              className="mt-8 flex flex-col gap-6 md:mt-14 md:flex-row md:gap-8 md:pr-[12vw]"
            >
              {steps.map((p) => (
                <article
                  key={p.step}
                  data-reveal
                  className="glass group flex shrink-0 flex-col justify-between rounded-3xl p-8 md:h-[46vh] md:w-[34vw] md:max-w-[460px]"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display text-6xl font-medium text-white/12 transition-colors duration-500 group-hover:text-accent/40 md:text-8xl">
                      {p.step}
                    </span>
                    <span className="h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_20px_var(--accent-glow)]" />
                  </div>
                  <div>
                    <h3 className="font-display text-3xl font-medium md:text-4xl">{p.title}</h3>
                    <p className="mt-3 max-w-xs text-fg-dim">{p.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
