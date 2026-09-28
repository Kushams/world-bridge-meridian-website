import type { NextConfig } from "next";

// GITHUB_PAGES also implies a repo-name subpath; STATIC_EXPORT is the same
// export served from a domain root (Cloudflare Pages, any static host).
// Neither is set for local dev, other CI, or a server build (e.g. Vercel).
const isGithubPagesBuild = process.env.GITHUB_PAGES === "true";
const isStaticExport = isGithubPagesBuild || process.env.STATIC_EXPORT === "true";
const basePath = isGithubPagesBuild ? "/world-bridge-meridian-website" : "";

const nextConfig: NextConfig = {
  ...(isStaticExport
    ? {
        output: "export",
        basePath,
      }
    : {}),
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  images: {
    unoptimized: isStaticExport,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
