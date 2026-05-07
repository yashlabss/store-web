import type { NextConfig } from "next";

// Proxy /api/* to Express.
// Prefer explicit env config, then fall back to local backend default (5000).
const backendUrl =
  process.env.BACKEND_URL?.trim() ||
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
  "http://127.0.0.1:5000";

const nextConfig: NextConfig = {
  experimental: {
    // Allow large request bodies (video base64 payloads) through Next proxy.
    proxyClientMaxBodySize: "500mb",
  },
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
  webpack: (config) => {
    // Avoid transient ChunkLoadError during slow first-time recompiles in dev.
    if (config?.output) {
      config.output.chunkLoadTimeout = 300000;
    }
    return config;
  },
};

export default nextConfig;
