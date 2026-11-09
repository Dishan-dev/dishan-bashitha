import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // The previous Vercel address forwards permanently to the canonical domain, path included.
  // Matched on host, so dishan.me itself is never redirected.
  async redirects() {
    return [{ source: "/:path*", has: [{ type: "host", value: "dishan-bashitha.vercel.app" }], destination: "https://dishan.me/:path*", permanent: true }];
  },
  images: { qualities: [75, 90] },
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    }];
  },
};

export default nextConfig;
