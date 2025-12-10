import type { NextConfig } from "next";

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/:sessionId",
        has: [
          {
            type: "host",
            value: "checkout.eventop.xyz",
          },
        ],
        destination: "/checkout/:sessionId",
      },
    ];
  },
};

export default nextConfig;