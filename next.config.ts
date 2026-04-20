import type { NextConfig } from "next";

// Proxy /api/* to Express. Requires store-backend running (default port 5001), or set BACKEND_URL.
const backendUrl = process.env.BACKEND_URL ?? "http://127.0.0.1:5001";

const nextConfig: NextConfig = {
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
