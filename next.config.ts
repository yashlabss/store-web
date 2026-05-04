import type { NextConfig } from "next";

// Proxy /api/* to Express.
// Prefer explicit env config, then fall back to local backend default (5001).
const backendUrl =
  process.env.BACKEND_URL?.trim() ||
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
  "http://127.0.0.1:5001";

const nextConfig: NextConfig = {
  turbopack: {
    // Prevent Next from picking the parent folder as workspace root.
    root: __dirname,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
