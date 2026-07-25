import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  experimental: {
    // Defaults to os.cpus().length - 1 build workers, which on a shared host
    // can wildly overstate the RAM actually available — 60+ parallel workers
    // exhausting memory mid-build surfaces as a garbled worker crash rather
    // than a clean OOM. Cap the ceiling and let memory drive the real count.
    cpus: 4,
    memoryBasedWorkersCount: true,
  },
};

export default nextConfig;
