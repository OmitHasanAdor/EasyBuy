import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
   images: {
    dangerouslyAllowSVG: true, 
    contentDispositionType: 'attachment',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        pathname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
        pathname: '**',
      },
      {
        protocol: "https",
        hostname: "img.kwcdn.com",
      },
    ],
  },
};

export default nextConfig;