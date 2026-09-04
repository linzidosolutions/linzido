import Link from "next/link";
import { Inter, Space_Grotesk, JetBrains_Mono, Bebas_Neue } from "next/font/google";
import Logo from "@/components/ui/Logo";
import "./(site)/globals.css";

/**
 * Root-level fallback for genuinely unmatched routes (typos, dead external
 * links) — these don't fall under any route group, so (site)/not-found.tsx
 * never actually renders for them; Next silently served its own bare-bones
 * default 404 instead. This reuses that page's exact content, with its own
 * minimal <html>/<body> since there's no shared root layout to inherit one
 * from at this level.
 */
export const metadata = { title: "404 — Lost in space" };

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });
const wordmark = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-wordmark",
  display: "swap",
});

export default function RootNotFound() {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable} ${mono.variable} ${wordmark.variable}`}>
      <body>
        <main className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 text-center">
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(60% 50% at 50% 30%, rgba(77,109,255,0.18), transparent 70%), #080808",
            }}
          />
          <div className="absolute left-6 top-6">
            <Logo />
          </div>

          <p className="eyebrow mb-6">Error 404</p>
          <h1 className="font-display text-[clamp(5rem,22vw,16rem)] font-medium leading-none tracking-tighter text-gradient">
            404
          </h1>
          <p className="mt-4 max-w-md text-fg-dim">
            This page drifted off into the void. Let&apos;s get you back to something
            that actually exists.
          </p>
          <Link href="/" className="btn btn-primary mt-10">
            ← Back home
          </Link>
        </main>
      </body>
    </html>
  );
}
