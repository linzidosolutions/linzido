"use client";

import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  speed?: number;
  reverse?: boolean;
  pauseOnHover?: boolean;
  className?: string;
};

/**
 * Seamless infinite marquee. Children are duplicated once and the track
 * translates -50%, so the loop is invisible. CSS-only → cheap and smooth.
 */
export default function Marquee({
  children,
  speed = 40,
  reverse = false,
  pauseOnHover = false,
  className,
}: Props) {
  return (
    <div className={cn("overflow-hidden", pauseOnHover && "marquee-paused", className)}>
      <div
        className="marquee-track"
        style={{
          ["--speed" as string]: `${speed}s`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        <div className="flex shrink-0" aria-hidden={false}>
          {children}
        </div>
        <div className="flex shrink-0" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
