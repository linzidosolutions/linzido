import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  // React Strict Mode double-invokes effects in dev (mount → cleanup →
  // mount) to surface unsafe side effects. The 3D WorkshopStage's
  // react-three-fiber <Canvas> manages its own WebGL context and DOM node
  // outside React's normal reconciliation, and that double-mount races with
  // it: React's own unmount pass tries to remove a canvas node R3F has
  // already torn down/replaced, throwing "NotFoundError: Failed to execute
  // 'removeChild'" on effectively every dev-mode page load. This is a known
  // incompatibility between React Strict Mode and react-three-fiber, not an
  // app bug — disabling Strict Mode removes the double-invoke and the race.
  reactStrictMode: false,
  // Next sends "X-Powered-By: Next.js" by default, and Payload appends
  // itself to the same header — free reconnaissance for anyone fingerprinting
  // the stack. Turning it off costs nothing functionally.
  poweredByHeader: false,
  // Only for the Docker build (which sets DOCKER_BUILD=1) — "standalone"
  // makes `next start`/`npm run start` misbehave, so it stays off for local
  // `npm run build && npm run start` testing and for Vercel (which ignores
  // this field regardless of its value).
  ...(process.env.DOCKER_BUILD === "1" ? { output: "standalone" as const } : {}),
  images: {
    // Local uploads served by Payload's Media collection.
    remotePatterns: [{ protocol: "http", hostname: "localhost" }],
  },
  async headers() {
    return [
      {
        // Every route — nothing here is route-specific.
        source: "/:path*",
        headers: [
          {
            // No `preload` — that requires submitting the domain to browsers'
            // preload lists, a one-way decision this task wasn't asked to make.
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Nothing on this site legitimately needs to be framed by another
          // site — blocks classic clickjacking.
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Denies the powerful APIs this site never uses; leaves everything
          // else at the browser default rather than guessing at more.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
        ],
      },
    ];
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
