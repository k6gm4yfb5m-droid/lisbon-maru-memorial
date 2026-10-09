import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Multipart requests pass through the framework's form parser before API routes.
  // Allow the three 5 MB attachments; the route enforces each individual limit.
  experimental: { serverActions: { bodySizeLimit: "16mb" } },
};

export default nextConfig;
