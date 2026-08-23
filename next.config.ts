import type { NextConfig } from "next";

// Set only by the GitHub Pages deploy workflow — keeps local dev, other CI,
// and any future host (e.g. Vercel) on the normal server build.
const isGithubPagesBuild = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  ...(isGithubPagesBuild
    ? {
        output: "export",
        basePath: "/world-bridge-meridian-website",
      }
    : {}),
  images: {
    unoptimized: isGithubPagesBuild,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
