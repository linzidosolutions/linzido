"use client";

import AnimatedText from "./AnimatedText";
import { cn } from "@/lib/utils";

/** Consistent section header: mono eyebrow + large animated title. */
export default function SectionHeading({
  eyebrow,
  title,
  className,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  className?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={cn(align === "center" && "text-center", className)}>
      <div
        className={cn(
          "mb-5 flex items-center gap-3",
          align === "center" && "justify-center"
        )}
      >
        <span className="h-px w-8 bg-accent" />
        <span className="eyebrow">{eyebrow}</span>
      </div>
      <AnimatedText as="h2" text={title} className="display-md block max-w-3xl" />
    </div>
  );
}
