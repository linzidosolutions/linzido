"use client";

import { useRef, useState } from "react";
import Image from "next/image";

type Slide = { src: string; alt: string };

/**
 * Screenshot slider for case-study pages. Deliberately simple: the image is
 * always a plain `fill` child of the bordered, overflow-hidden frame — no
 * transform-based drag or slide animation — so it can never visually escape
 * the frame the way a framer-motion `drag` element did in an earlier version.
 */
export default function ImageSlider({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  if (slides.length === 0) return null;

  const go = (next: number) => setIndex((next + slides.length) % slides.length);

  return (
    <div className="relative">
      <div
        className="relative aspect-[21/9] overflow-hidden rounded-3xl border border-line bg-surface"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current == null) return;
          const delta = e.changedTouches[0].clientX - touchStartX.current;
          if (delta > 60) go(index - 1);
          else if (delta < -60) go(index + 1);
          touchStartX.current = null;
        }}
      >
        <Image
          key={slides[index].src}
          src={slides[index].src}
          alt={slides[index].alt}
          fill
          sizes="(max-width: 1320px) 100vw, 1320px"
          className="object-cover object-top"
          priority={index === 0}
        />

        {slides.length > 1 && (
          <>
            <button
              aria-label="Previous screenshot"
              onClick={() => go(index - 1)}
              className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/60"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              aria-label="Next screenshot"
              onClick={() => go(index + 1)}
              className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/60"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </>
        )}
      </div>

      {slides.length > 1 && (
        <div className="mt-5 flex items-center justify-center gap-2">
          {slides.map((s, i) => (
            <button
              key={s.src}
              aria-label={`Go to screenshot ${i + 1}`}
              onClick={() => go(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-6 bg-accent" : "w-1.5 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
