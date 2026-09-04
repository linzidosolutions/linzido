"use client";

import { useEffect, useRef } from "react";
import { registerGsap, gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Props = {
  text: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  as?: any;
  className?: string;
  /** stagger unit */
  by?: "word" | "char";
  /** start animation on scroll into view (default) or immediately */
  trigger?: "scroll" | "mount";
  delay?: number;
};

/**
 * Splits text into words/chars and reveals them with a staggered
 * rise + blur — a hand-rolled SplitText that needs no premium plugin.
 */
export default function AnimatedText({
  text,
  as: Tag = "span",
  className,
  by = "word",
  trigger = "scroll",
  delay = 0,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    registerGsap();

    const units = Array.from(el.querySelectorAll<HTMLElement>("[data-unit]"));
    if (!units.length) return;

    if (prefersReducedMotion()) {
      gsap.set(units, { opacity: 1, y: 0, filter: "none" });
      return;
    }

    gsap.set(units, { yPercent: 115, opacity: 0 });

    const anim = () =>
      gsap.to(units, {
        yPercent: 0,
        opacity: 1,
        duration: 1,
        ease: "power4.out",
        stagger: by === "char" ? 0.02 : 0.06,
        delay,
      });

    let st: ScrollTrigger | undefined;
    if (trigger === "mount") {
      anim();
    } else {
      st = ScrollTrigger.create({
        trigger: el,
        start: "top 88%",
        once: true,
        onEnter: anim,
      });
    }

    return () => st?.kill();
  }, [text, by, trigger, delay]);

  const units = by === "char" ? Array.from(text) : text.split(" ");

  return (
    <Tag ref={ref} className={cn(className)} aria-label={text}>
      {units.map((u, i) => (
        <span
          key={i}
          aria-hidden
          style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top" }}
        >
          <span data-unit style={{ display: "inline-block", willChange: "transform" }}>
            {u === " " ? " " : u}
          </span>
          {by === "word" && i < units.length - 1 ? " " : ""}
        </span>
      ))}
    </Tag>
  );
}
