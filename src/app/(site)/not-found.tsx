import Link from "next/link";
import Logo from "@/components/ui/Logo";

export const metadata = { title: "404 — Lost in space" };

export default function NotFound() {
  return (
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
  );
}
