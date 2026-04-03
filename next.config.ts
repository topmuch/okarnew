import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "https://preview-chat-53f84bc3-cd2a-407c-853e-7c339d7f8564.space.z.ai",
  ],
};

export default nextConfig;
