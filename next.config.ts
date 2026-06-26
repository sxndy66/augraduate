import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.env.INIT_CWD,
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [{ key: "Service-Worker-Allowed", value: "/" }],
      },
    ];
  },
};

export default nextConfig;
