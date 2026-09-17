import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
   images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.kwcdn.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
      },
    ],
  },
};

export default function config(phase: string): NextConfig {
  // NEXT_PUBLIC_API_URL is baked into the bundle at build time. Stop the
  // production build with a clear message instead of deploying a site whose
  // dashboards call "undefined/api/..." (EB-05).
  // `next typegen` loads the config with the same phase, so only enforce
  // this for an actual `next build`.
  const isNextBuild = phase === PHASE_PRODUCTION_BUILD && process.argv.includes("build");

  if (isNextBuild && !process.env.NEXT_PUBLIC_API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not set. Add it to .env.local or to the Vercel " +
        "project's Environment Variables (e.g. https://easybuy-server-kszk.onrender.com) " +
        "and build again."
    );
  }

  return nextConfig;
}
