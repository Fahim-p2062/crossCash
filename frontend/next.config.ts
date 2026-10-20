import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;
    if (backendUrl && !backendUrl.includes("localhost") && !backendUrl.startsWith("/")) {
      return [
        {
          source: "/api/:path*",
          destination: `${backendUrl.replace(/\/$/, "")}/api/:path*`,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
