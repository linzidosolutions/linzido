"use client";

import { useMagnetic } from "@/hooks/useMagnetic";
import { cn } from "@/lib/utils";

type Props = React.ComponentPropsWithoutRef<"a"> & {
  variant?: "primary" | "ghost";
  strength?: number;
};

/**
 * Anchor styled as a magnetic button. The inner label eases at a lower
 * strength than the shell for a layered "pull" effect.
 */
export default function MagneticButton({
  variant = "primary",
  strength = 0.45,
  className,
  children,
  ...rest
}: Props) {
  const ref = useMagnetic<HTMLAnchorElement>(strength);
  const labelRef = useMagnetic<HTMLSpanElement>(strength * 0.55);

  return (
    <a
      ref={ref}
      data-cursor="button"
      className={cn("btn", variant === "primary" ? "btn-primary" : "btn-ghost", className)}
      {...rest}
    >
      <span ref={labelRef} className="inline-flex items-center gap-2">
        {children}
      </span>
    </a>
  );
}
