import type { NextConfig } from "next";

// Deploy on a host that runs Next.js (Vercel, Netlify): the contact form
// needs the /api/contact server route, so a plain static export won't work.
const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["192.168.16.92"],
  // three.js ships ES modules that Next can bundle directly.
  transpilePackages: ["three"],
};

export default nextConfig;
