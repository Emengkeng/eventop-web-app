import type { NextConfig } from "next";

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/",
        has: [
          {
            type: "host",
            value: "checkout.eventop.xyz",
          },
        ],
        destination: "/checkout",
      },
    ];
  },
};

export default nextConfig;
