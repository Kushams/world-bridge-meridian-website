import type { NextConfig } from "next";

// Set only by the GitHub Pages deploy workflow — keeps local dev, other CI,
// and any future host (e.g. Vercel) on the normal server build.
const isGithubPagesBuild = process.env.GITHUB_PAGES === "true";
const basePath = isGithubPagesBuild ? "/world-bridge-meridian-website" : "";

const nextConfig: NextConfig = {
  ...(isGithubPagesBuild
    ? {
        output: "export",
        basePath,
      }
    : {}),
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
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
